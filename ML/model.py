from torch import nn
import torch


class Freq_Model(nn.Module):
    def __init__(self):
        super(Freq_Model, self).__init__()
        self.inputsize = 48 * 64  # should be 3072

        self.ch_att = nn.Linear(64, 64)
        self.freq_att = nn.Linear(48, 48)

        self.FC1 = nn.Linear(self.inputsize, 1024)
        self.FC2 = nn.Linear(1024, 128)
        self.FC3 = nn.Linear(128, 2)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.3)
        self.sigmoid = nn.Sigmoid()
        # self.softmax = nn.Softmax(dim=1)

    def forward(self, x):
        # x = x.view(x.size(0), -1)

        # average along OTHER dimension (e.g. freq dimension for channels) to get a summary along that axis
        ch = torch.mean(x, dim=2)
        freq = torch.mean(x, dim=1)

        # get attention maps
        ch_att = self.ch_att(ch)
        freq_att = self.freq_att(freq)

        # combine by batch matrix multiply with proper dimension expanding (b, c, 1) x (b, 1, f) = (b, c, f)
        comb_att = torch.bmm(ch_att.unsqueeze(2), freq_att.unsqueeze(1))
        comb_att = self.sigmoid(comb_att)
        # comb_att = self.softmax(comb_att.flatten(1)).view(-1, args.patch_classes, args.frequency_size)

        # get attention by summing and flatten for rest of model
        x = x * comb_att
        x = x.flatten(1)

        x = self.relu(self.FC1(x))
        x = self.relu(self.FC2(x))
        # x = self.dropout(x)
        x = self.FC3(x)

        return x
