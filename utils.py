
board_dict = {1: 'blue      ', 2: 's_h_blue ', 3: 's_v_blue ', 4: 'blue_w   ', 5: 'green    ',
              6: 's_h_green ', 7: 's_v_green', 8: 'green_w  ', 9: 'orange   ', 10: 's_h_orange',
              11: 's_v_orange', 12: 'orange_w  ', 13: 'purple    ', 14: 's_h_purple',
              15: 's_v_purple', 16: 'purple_w  ', 17: 'red       ', 18: 's_h_red   ',
              19: 's_v_red   ', 20: 'red_w     ', 21: 'yellow    ', 22: 's_h_yellow',
              23: 's_v_yellow', 24: 'yellow_w  ', 25: 'chocolate ', -1: 'empty     '}


def print_board(board):
    # print(board_dict[board[0][3]], board_dict[board[0][4]])
    for line in board:
        for elem in line:
            print(board_dict[elem], end=' ')
        print('\n')
