from math import floor
from turtle import Turtle, exitonclick, setworldcoordinates
from random import randint

size = 1
cercleSize = size/8
tirage = int(input('tirage:\t'))
racineTirage = floor(tirage**(1/2))
setworldcoordinates(0, 0, (racineTirage+(not(tirage==racineTirage**2)))*(size+size/3), (racineTirage+(not(tirage==racineTirage**2)))*(size+size/3)) #ajustement de la taille de la carte
t = Turtle()#creation de la tortue
t.speed(0)
t.fillcolor('red')
rows = [racineTirage]*racineTirage+[tirage-racineTirage**2]  #création du tableau/matris
tour=0  #varible qui compte le nombre de tour 

for row in rows:
    posY = (size+size/3)*tour   #position sur l'axe y
    tour+=1
    for nbcarre in range(row):    #création de la ligne et possitionnement de l'axe x
        t.goto(nbcarre*(size+size/3), posY)
        t.pendown()
        de = randint(1,6)   #numéro du dé
        for _ in range(4):  #création du carré
            t.forward(size)
            t.left(90)
        t.penup()
        if de in [1, 3, 5]: #dé de 1, 3, 5 cercles
            t.forward(size/2)
            t.sety((size/2)-(cercleSize)+posY)
            t.begin_fill()
            t.circle(cercleSize)
            t.end_fill()
        if de in [2, 3, 4, 5, 6]: #dé de 2, 3, 4, 5, 6 cercles
            if de != 2:
                for i in [1, 3]:    #dé de 3, 4, 5, 6 cercles
                    t.goto(nbcarre*(size+size/3), i/4*size-cercleSize+posY)
                    t.forward(size*i/4)
                    t.begin_fill()
                    t.circle(cercleSize)
                    t.end_fill()
            if de !=3:  #dé de 2, 4, 5, 6 cercles
                if de == 6: #dé de 6 cercles
                    t.goto(nbcarre*(size+size/3), size/2-cercleSize+posY)
                    for _ in range(2):
                        t.forward(size/4)
                        t.begin_fill()
                        t.circle(cercleSize)
                        t.end_fill()
                        t.forward(size/4)
                for i in [3,1]: #dé de 2, 4, 5, 6 cercles
                    t.goto(nbcarre*(size+size/3),size-(i/4*size)-cercleSize+posY)
                    t.forward(size*i/4)
                    t.begin_fill()
                    t.circle(cercleSize)
                    t.end_fill()

exitonclick()