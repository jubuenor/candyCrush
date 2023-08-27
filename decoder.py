import numpy as np
from sklearn import svm
from sklearn.model_selection import train_test_split
import joblib
from PIL import Image
import os


class ImgRecognizer:
    def __init__(self):
        self.train_data = []
        self.target_value = []
        self.svc = svm.SVC(gamma=0.001, kernel='linear', C=100)
        self.downscale_res = (32, 32)

    def _load(self, path, target):
        train_imgs = os.listdir(path)
        for file in train_imgs:
            img = Image.open(path + '/' + file)
            img = img.resize(self.downscale_res, Image.BILINEAR)
            self.train_data.append(np.array(img.getdata()).flatten())
            self.target_value.append(target)

    def load(self):
        self._load('Images/Blue', 0)
        self._load('Images/Blue_sh', 0)
        self._load('Images/Blue_sv', 0)
        self._load('Images/Blue_w', 0)
        self._load('Images/Green', 2)
        self._load('Images/Green_sh', 3)
        self._load('Images/Green_sv', 14)
        self._load('Images/Green_w', 20)
        self._load('Images/Orange', 4)
        self._load('Images/Orange_sh', 5)
        self._load('Images/Orange_sv', 15)
        self._load('Images/Orange_w', 21)
        self._load('Images/Purple', 6)
        self._load('Images/Purple_sh', 7)
        self._load('Images/Purple_sv', 18)
        self._load('Images/Purple_w', 22)
        self._load('Images/Red', 8)
        self._load('Images/Red_sh', 9)
        self._load('Images/Red_sv', 16)
        self._load('Images/Red_w', 23)
        self._load('Images/Yellow', 10)
        self._load('Images/Yellow_sh', 11)
        self._load('Images/Yellow_sv', 17)
        self._load('Images/Yellow_w', 24)
        self._load('Images/Chocolate', 12)

    def train(self):
        if os.path.isfile('svc.dat'):
            print("Loading svc.dat")
            self.svc = joblib.load('svc.dat')
            print(self.svc)
        else:
            print("Training...")
            self.load()
            np_data = np.array(self.train_data)
            np_value = np.array(self.target_value)
            self.svc.fit(np_data, np_value)
            joblib.dump(self.svc, 'svc.dat', compress=9)

    def test(self):
        np_train_data = np.array(self.train_data)
        np_value_data = np.array(self.target_value)
        print(np_train_data)
        print(np_value_data)
        data, test_data, train_target, test_target = train_test_split(
            np_train_data, np_value_data, test_size=0.4, random_state=0)
        self.svc.fit(data, train_target)
        print(self.svc.score(test_data, test_target))

    def predict(self, img):
        img = img.resize(self.downscale_res, Image.BILINEAR)
        img_data = np.array(img.getdata()).flatten()
        return self.svc.predict([img_data])


deco = ImgRecognizer()

deco.train()
# deco.test()
