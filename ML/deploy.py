from ML.model import Freq_Model
import torch
import numpy as np
from scipy import signal
from glob import glob
import random


class DeployModel:

    def __init__(self, model_path='/ML/spectro_mlp_s14_21.pt', data_path='/ML/s14_val/', channels=64, seq_length=1024):

        self.ch = channels
        self.seq_len = seq_length

        self.datapaths = glob(data_path + '*')
        random.shuffle(self.datapaths)
        self.dataind = 0

        # load model
        model = Freq_Model()
        pretrained_dict = torch.load(model_path)['state_dict']
        model_dict = model.state_dict()
        pretrained_dict = {k: v for k, v in pretrained_dict.items() if k in model_dict}
        model_dict.update(pretrained_dict)
        model.load_state_dict(model_dict)
        self.model = model.cuda().eval()

    def process_data(self, data, samp_freq=250, nperseg=32):
        # assume we receive ch*seq_len array, choose nperseg to make a square array
        total_spectrograms = []
        for cha in range(len(data)):
            # use n per seg of 1024 to have a shape of 513x1
            f, t, spectro = signal.spectrogram(data[cha, :], fs=samp_freq, nperseg=nperseg)

            # divide by mean of each channel to normalize, take only relevant frequencies
            spectro = spectro[14:62, 0]
            spectro = spectro / spectro.mean()
            # spectro = (spectro - spectro.mean()) / spectro.std()

            total_spectrograms.append(spectro)

        total_spectrograms = np.asarray(total_spectrograms)  # .flatten(), remove flatten for channel attention idea
        total_spectrograms = torch.from_numpy(total_spectrograms).float().unsqueeze(0)
        return total_spectrograms

    def data_gen_test(self):
        # while True:
        # temp data out
        # data = np.random.normal(loc=0, scale=1, size=(self.ch, self.seq_len))
        # df_ecg = cytonBoard.poll(seq_length)  # Polling for samples
        # data = df_ecg.iloc[:, 0].values  ## extracting values

        datadict = np.load(self.datapaths[self.dataind], allow_pickle=True).flatten()[0]
        data = datadict['data']

        # convert from micro to millivolts?
        data = data / 1000

        # get label, convert to binary value
        label = datadict['label']
        label = 0 if label == 'left' else 1

        self.dataind += 1

        return data, label
        # time.sleep(1)  # Updating the window in every one second

    def get_data_and_output(self):

        # get generator
        x, label = self.data_gen_test()

        # no grad for eval
        with torch.no_grad():

            # send data and get model output
            proc_data = self.process_data(x, samp_freq=512, nperseg=1024).cuda()
            out = self.model(proc_data)
            out = torch.argmax(out, dim=1).item()

            data = [d.tolist() for d in x]

        return data, out
