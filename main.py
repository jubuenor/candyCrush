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


board_box = (102, 102, 742, 672)
img_size = (board_box[2]-board_box[0], board_box[3]-board_box[1])
cell_size = (img_size[0]/9, img_size[1]/9)

board_size = 9
game_board = np.zeros((board_size, board_size), dtype=np.int32)
recognizer = ImgRecognizer()


def open_game():
    subprocess.Popen(
        "cd ~ && cd Downloads/ruffle-nightly-2023_08_26-linux-x86_64/ && ./ruffle", shell=True)


def get_coords(cell):
    x = board_box[0] + cell[1] * cell_size[0] + cell_size[0]/2
    y = board_box[1] + cell[0] * cell_size[1] + cell_size[1]/2
    return x, y


def move(move):
    # print('Moving {0}'.format(move))
    start = move[0]
    end = move[1]

    start_w = get_coords(start)
    end_w = get_coords(end)

    # print(start_w, end_w)

    print(utils.print_candy(game_board[start[0]][start[1]]), utils.print_candy(
        game_board[end[0]][end[1]]))

    pg.moveTo(start_w[0], start_w[1])
    time.sleep(0.05)
    pg.click()
    time.sleep(0.1)
    pg.moveTo(end_w[0], end_w[1])
    time.sleep(0.05)
    pg.click()
    pg.moveTo(1100, 1100)


def grab_board():
    global game_board
    img = ImageGrab.grab(bbox=board_box)
    # img.show()
    for y in range(0, 9):
        for x in range(0, 9):
            cell = img.crop(
                (x*cell_size[0], y*cell_size[1], (x+1)*cell_size[0], (y+1)*cell_size[1]))
            game_board[y][x] = recognizer.predict(cell).item()

    # utils.print_board(game_board)
    return img


ref_img = None


def board_is_moving():
    global ref_img
    img = ImageGrab.grab()
    img = img.crop(board_box)
    img = img.resize((img.size[0]//4, img.size[1]//4), Image.BILINEAR)

    has_movement = True
    if ref_img:
        has_movement = compare(img, ref_img, threshold=100) > 100

    ref_img = img
    return has_movement


def next_lvl():
    board_img = grab_board()
    board_img = board_img.resize(
        (board_img.size[0]//4, board_img.size[1]//4), Image.BILINEAR)

    img_next_lvl = Image.open('Images/background.bmp')
    img_next_lvl = img_next_lvl.resize(
        (img_next_lvl.size[0]//4, img_next_lvl.size[1]//4), Image.BILINEAR)
    if compare(board_img, img_next_lvl, threshold=100) < 3000:
        return True
    return False


def game_over(board_img):

    img_end = Image.open('Images/end_screen.bmp')
    img_end = img_end.resize(
        (img_end.size[0]//4, img_end.size[1]//4), Image.BILINEAR)
    if compare(board_img, img_end, threshold=100) < 3000:
        return True

    return False


def are_pixels_equal(p1, p2, threshold):
    diff = 0
    for i in range(3):
        diff += abs(p1[i]-p2[i])
    return diff < threshold


def compare(current, reference, threshold):
    current_data = np.array(current.getdata())
    ref_data = np.array(reference.getdata())

    diff_pixels = 0
    total_size = current.size[0]*current.size[1]
    for i in range(0, total_size-3, 3):
        if not are_pixels_equal(current_data[i], ref_data[i], threshold):
            diff_pixels += 1

    # print(diff_pixels)
    return diff_pixels


def main():
    recognizer.train()
    game_solver = solver.Solver()
    moves = 0
    # grab_board()
    open_game()
    ready = input('Ready? (y/n)')
    if ready == 'y':
        while True:
            if not board_is_moving() and not next_lvl():
                print('Board is not moving')
                board_img = grab_board()
                board_img = board_img.resize(
                    (board_img.size[0]//4, board_img.size[1]//4), Image.BILINEAR)
                if game_over(board_img):
                    print('Game over')
                    break
                moves += 1
                score, nmove = game_solver.solve_board(game_board)
                print('Move found. Score {0}, move = {1}'.format(score, nmove))
                move(nmove)
                time.sleep(0.3)
            else:
                print('Board is moving')

        print('Game finished in {0} moves'.format(moves))


if __name__ == '__main__':
    main()
