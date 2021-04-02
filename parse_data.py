import pandas as pd


data = pd.read_csv('./data_files/EEGData_Test.txt', sep="\s*,",
                   header=0, skiprows=4, engine='python')
data.columns = data.columns.str.lstrip()
data.to_csv("./data_files/output.csv", encoding='utf-8', index=False)
