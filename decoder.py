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
        self.svc = svm.SVC(gamma="scale", kernel='rbf', C=1.0)
        self.downscale_res = (48, 48)

    def _load(self, path, target):
        train_imgs = os.listdir(path)
        for file in train_imgs:
            img = Image.open(path + '/' + file)
            img = img.resize(self.downscale_res, Image.BILINEAR)
            self.train_data.append(np.array(img.getdata()).flatten())
            self.target_value.append(target)

    def load(self):
        self._load('Images/Blue/normal', 1)
        self._load('Images/Blue/ctl', 1)
        self._load('Images/Blue/ctr', 1)

        self._load('Images/Blue/sh', 2)
        self._load('Images/Blue/sh_ctr', 2)
        self._load('Images/Blue/sh_ctl', 2)

        self._load('Images/Blue/sv', 3)
        self._load('Images/Blue/sv_ctl', 3)
        self._load('Images/Blue/sv_ctr', 3)

        self._load('Images/Blue/w', 4)
        self._load('Images/Blue/w_ctl', 4)
        self._load('Images/Blue/w_ctr', 4)

        self._load('Images/Green/normal', 5)
        self._load('Images/Green/ctl', 5)
        self._load('Images/Green/ctr', 5)

        self._load('Images/Green/sh', 6)
        self._load('Images/Green/sh_ctl', 6)
        self._load('Images/Green/sh_ctr', 6)

        self._load('Images/Green/sv', 7)
        self._load('Images/Green/sv_ctl', 7)
        self._load('Images/Green/sv_ctr', 7)

        self._load('Images/Green/w', 8)
        self._load('Images/Green/w_ctl', 8)
        self._load('Images/Green/w_ctr', 8)

        self._load('Images/Orange/normal', 9)
        self._load('Images/Orange/ctl', 9)
        self._load('Images/Orange/ctr', 9)

        self._load('Images/Orange/sh', 10)
        self._load('Images/Orange/sh_ctl', 10)
        self._load('Images/Orange/sh_ctr', 10)

        self._load('Images/Orange/sv', 11)
        self._load('Images/Orange/sv_ctl', 11)
        self._load('Images/Orange/sv_ctr', 11)

        self._load('Images/Orange/w', 12)
        self._load('Images/Orange/w_ctl', 12)
        self._load('Images/Orange/w_ctr', 12)

        self._load('Images/Purple/normal', 13)
        self._load('Images/Purple/ctl', 13)
        self._load('Images/Purple/ctr', 13)

        self._load('Images/Purple/sh', 14)
        self._load('Images/Purple/sh_ctl', 14)
        self._load('Images/Purple/sh_ctr', 14)

        self._load('Images/Purple/sv', 15)
        self._load('Images/Purple/sv_ctl', 15)
        self._load('Images/Purple/sv_ctr', 15)

        self._load('Images/Purple/w', 16)
        self._load('Images/Purple/w_ctl', 16)
        self._load('Images/Purple/w_ctr', 16)

        self._load('Images/Red/normal', 17)
        self._load('Images/Red/ctl', 17)
        self._load('Images/Red/ctr', 17)

        self._load('Images/Red/sh', 18)
        self._load('Images/Red/sh_ctl', 18)
        self._load('Images/Red/sh_ctr', 18)

        self._load('Images/Red/sv', 19)
        self._load('Images/Red/sv_ctl', 19)
        self._load('Images/Red/sv_ctr', 19)

        self._load('Images/Red/w', 20)
        self._load('Images/Red/w_ctl', 20)
        self._load('Images/Red/w_ctr', 20)

        self._load('Images/Yellow/normal', 21)
        self._load('Images/Yellow/ctl', 21)
        self._load('Images/Yellow/ctr', 21)

        self._load('Images/Yellow/sh', 22)
        self._load('Images/Yellow/sh_ctl', 22)
        self._load('Images/Yellow/sh_ctr', 22)

        self._load('Images/Yellow/sv', 23)
        self._load('Images/Yellow/sv_ctl', 23)
        self._load('Images/Yellow/sv_ctr', 23)

        self._load('Images/Yellow/w', 24)
        self._load('Images/Yellow/w_ctl', 24)
        self._load('Images/Yellow/w_ctr', 24)

        self._load('Images/Chocolate/normal', 25)
        self._load('Images/Chocolate/ctl', 25)
        self._load('Images/Chocolate/ctr', 25)

    def train(self):
        if os.path.isfile('svc.dat'):
            print("Loading svc.dat")
            self.svc = joblib.load('svc.dat')
            print(self.svc)
        else:
            print("Training...")
            self.load()
            print(len(self.train_data))
            print(len(self.target_value))
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


# deco = ImgRecognizer()

# deco.train()
# deco.test()
