import numpy as np
from PIL import Image
from PIL import ImageGrab
import numpy as np
from decoder import ImgRecognizer
import time
import utils
import solver
import subprocess

import pyautogui as pg


class Agent:

    def __init__(self):
        self.board_box = (102, 102, 742, 672)
        self.img_size = (
            self.board_box[2]-self.board_box[0], self.board_box[3]-self.board_box[1])
        self.cell_size = (self.img_size[0]/9, self.img_size[1]/9)

        self.board_size = 9
        self.game_board = np.zeros(
            (self.board_size, self.board_size), dtype=np.int32)
        self.recognizer = ImgRecognizer()
        self.ref_img = None

    def open_game(self):
        subprocess.Popen(
            "cd ~ && cd Downloads/ruffle-nightly-2023_08_26-linux-x86_64/ && ./ruffle", shell=True)

    def get_coords(self, cell):
        x = self.board_box[0] + cell[1] * \
            self.cell_size[0] + self.cell_size[0]/2
        y = self.board_box[1] + cell[0] * \
            self.cell_size[1] + self.cell_size[1]/2
        return x, y

    def move(self, move):
        # print('Moving {0}'.format(move))
        start = move[0]
        end = move[1]

        start_w = self.get_coords(start)
        end_w = self.get_coords(end)

        # print(start_w, end_w)

        # print(utils.print_candy(self.game_board[start[0]][start[1]]), utils.print_candy(self.game_board[end[0]][end[1]]))

        pg.moveTo(start_w[0], start_w[1])
        time.sleep(0.05)
        pg.click()
        time.sleep(0.1)
        pg.moveTo(end_w[0], end_w[1])
        time.sleep(0.05)
        pg.click()
        pg.moveTo(1100, 1100)

    def grab_board(self):
        global game_board
        img = ImageGrab.grab(bbox=self.board_box)
        # img.show()
        for y in range(0, 9):
            for x in range(0, 9):
                cell = img.crop(
                    (x*self.cell_size[0], y*self.cell_size[1], (x+1)*self.cell_size[0], (y+1)*self.cell_size[1]))
                self.game_board[y][x] = self.recognizer.predict(cell).item()

        # utils.print_board(game_board)
        return img

    def board_is_moving(self):
        img = ImageGrab.grab()
        img = img.crop(self.board_box)
        img = img.resize((img.size[0]//4, img.size[1]//4), Image.BILINEAR)

        has_movement = True
        if self.ref_img:
            has_movement = self.compare(img, self.ref_img, threshold=100) > 100

        self.ref_img = img
        return has_movement

    def next_lvl(self):
        board_img = self.grab_board()
        board_img = board_img.resize(
            (board_img.size[0]//4, board_img.size[1]//4), Image.BILINEAR)

        img_next_lvl = Image.open('Images/background.bmp')
        img_next_lvl = img_next_lvl.resize(
            (img_next_lvl.size[0]//4, img_next_lvl.size[1]//4), Image.BILINEAR)
        if self.compare(board_img, img_next_lvl, threshold=100) < 3000:
            return True
        return False

    def game_over(self, board_img):

        img_end = Image.open('Images/end_screen.bmp')
        img_end = img_end.resize(
            (img_end.size[0]//4, img_end.size[1]//4), Image.BILINEAR)
        if self.compare(board_img, img_end, threshold=100) < 3000:
            return True

        return False

    def are_pixels_equal(self, p1, p2, threshold):
        diff = 0
        for i in range(3):
            diff += abs(p1[i]-p2[i])
        return diff < threshold

    def compare(self, current, reference, threshold):
        current_data = np.array(current.getdata())
        ref_data = np.array(reference.getdata())

        diff_pixels = 0
        total_size = current.size[0]*current.size[1]
        for i in range(0, total_size-3, 3):
            if not self.are_pixels_equal(current_data[i], ref_data[i], threshold):
                diff_pixels += 1

        # print(diff_pixels)
        return diff_pixels

    def main(self):
        self.recognizer.train()
        game_solver = solver.Solver()
        moves = 0
        # self.grab_board()
        self.open_game()
        ready = input('Ready? (y/n)')
        if ready == 'y':
            print('Starting game...')
            while True:
                if not self.board_is_moving() and not self.next_lvl():
                    # print('Board is not moving')
                    board_img = self.grab_board()
                    board_img = board_img.resize(
                        (board_img.size[0]//4, board_img.size[1]//4), Image.BILINEAR)
                    if self.game_over(board_img):
                        print('Game over...')
                        break
                    moves += 1
                    score, nmove = game_solver.solve_board(self.game_board)
                    # print('Move found. Score {0}, move = {1}'.format(score, nmove))
                    self.move(nmove)
                    time.sleep(0.3)
                # else:
                    # print('Board is moving')

        print('Game finished in {0} moves'.format(moves))


if __name__ == '__main__':
    player = Agent()
    player.__init__()
    player.main()
