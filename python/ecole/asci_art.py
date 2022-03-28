from math import floor
from random import random

row = lambda x : 'X '*x

def carre(size):
    print(row(size)+('\nX '+'  '*(size-2)+'X')*(size-2)+'\n'+row(size))

def croix(size):
    print((row(size)+('\nX '+('  '*floor(size/2-1)+'X ')*2)*floor(size/2-1)+'\n')*2+row(size) if size%2!=0 else 'La valeur doit être impaire')

def diagonal(size):
    print(row(size)+'\n'+(''.join('X '+'  '*i+'X '+'  '*(size-2-i-1)+'X\n' for i in range(size-2)))+row(size))

def origami(size):
    print(row(size)+''.join('\nX '+'  '*(size-3-i)+'X '+'  '*i+'X' for i in range(floor(size/2)))+'\n'+''.join('X '+'  '*(i-2)+'X '+'  '*(size-i*2)+'X '+'  '*(i-2)+'X\n' for i in range(floor(size/2), 1, -1))+row(size) if size%2!=0 else 'La valeur doit être impaire')

def triangle(size):
    print('  '*(size+1)+'X'+'\n'+''.join('  '*(i)+'X '+'  '*((size-i)*2+1)+'X\n' for i in range(size, 0, -1))+row(size*2+3))
    
def negatifTriangle(size): 
    print(row(size*2+3)+''.join('\n'+'X '*(size+1-i)+'  '*(i*2+1)+'X '*(size+1-i) for i in range(size+1))+'\n'+row(size*2+3))

def arbre(size, luck = 0.3):
    df = list(' '*(size+1)+'*'+'\n'+' '*(size+1)+'^'+'\n'+''.join(' '*(size-i)+'/'+'"'*(2*i+1)+'\\\n' for i in range(size))+(' '*size+'|||\n')*3)
    for i in range(len(df)):
        if df[i]=='"' and random() < luck:
            df[i] = 'O'
    print(''.join(df))

