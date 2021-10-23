from math import floor
from turtle import Turtle, exitonclick, setworldcoordinates
from random import randint

size = 1 #valeur sans importance doit être != 0
cercleSize = size/10 #/6 est la taille max avant les problèmes /8 est pas mal /10 peut être meilleur
tirage = int(input('tirage:\t'))
racineTirage = floor(tirage**(1/2))
setworldcoordinates(0, 0, (racineTirage+(tirage-racineTirage**2)//racineTirage+(not(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage)==0)))*(size+size/3), (racineTirage+(tirage-racineTirage**2)//racineTirage+(not(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage)==0)))*(size+size/3)) #ajustement de la taille de la carte
t = Turtle()#création de la tortue
t.speed(0)
t.fillcolor('red')
rows = [racineTirage+1]*(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage)) + [racineTirage+((tirage-racineTirage**2)//racineTirage)]*(racineTirage-(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage))) + [tirage-(racineTirage+1)*(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage))-(racineTirage+((tirage-racineTirage**2)//racineTirage))*(racineTirage-(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage)))]  #création du tableau/"matris"
tour=0  #varible qui compte le nombre de tour 

for row in rows:
    posY = (size+size/3)*tour   #position sur l'axe y. peux être supprimer pour gagnier 1 ligne
    tour+=1
    for nbcarre in range(row):    #création de la ligne. nbcarre est le numéro du carré en cour sur la rangée
        posX = nbcarre*(size+size/3)
        t.goto(posX, posY)
        t.pendown()
        de = randint(1,6)   #numéro du dé
        for _ in range(4):  #création du carré
            t.forward(size)
            t.left(90)
        t.penup()
        if de in [1, 3, 5]: #dé de 1, 3, 5 cercles équivalent  équivalent: if de == 1 or de == 3 or de == 5:. 
            t.goto(posX+size/2,(size/2)-(cercleSize)+posY)
            t.begin_fill()
            t.circle(cercleSize)
            t.end_fill()
        if de in [2, 3, 4, 5, 6]: #dé de 2, 3, 4, 5, 6 cercles équivalent : if de == 2 or de == 3 or de == 4 or de == 5 or de == 6:.
            if de != 2:
                for i in [1, 3]:    #dé de 3, 4, 5, 6 cercles équivalent : for i in range(1, 3):
                    t.goto(posX+size*i/4, i/4*size-cercleSize+posY)
                    t.begin_fill()
                    t.circle(cercleSize)
                    t.end_fill()
            if de !=3:  #dé de 2, 4, 5, 6 cercles
                if de == 6: #dé de 6 cercles
                    for i in [1, 3]: #équivalent for i in range(1, 3):
                        t.goto(posX+size*i/4, size/2-cercleSize+posY)
                        t.begin_fill()
                        t.circle(cercleSize)
                        t.end_fill()
                for i in [3,1]: #dé de 2, 4, 5, 6 cercles équivalent : for i in range(3, 0, -1):
                    t.goto(posX+size*i/4,size-(i/4*size)-cercleSize+posY)
                    t.begin_fill()
                    t.circle(cercleSize)
                    t.end_fill()

exitonclick()

# using def can be improved. 45 lignes
"""
from math import floor
from turtle import Turtle, exitonclick, setworldcoordinates
from random import randint

size = 1
cercleSize = size/8
tirage = int(input('tirage:\t'))
racineTirage = floor(tirage**(1/2))
setworldcoordinates(0, 0, (racineTirage+(not(tirage==racineTirage**2)))*(size+size/3), (racineTirage+(not(tirage==racineTirage**2)))*(size+size/3)) #ajustement de la taille de la carte
t = Turtle()#création de la tortue
t.speed(0)
t.fillcolor('red')
rows = [racineTirage]*racineTirage+[tirage-racineTirage**2]  #création du tableau/matris
tour=0  #varible qui compte le nombre de tour
 
def myCercle():
    t.begin_fill()
    t.circle(cercleSize)
    t.end_fill()

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
            t.goto(nbcarre*(size+size/3)+size/2,(size/2)-(cercleSize)+posY)
            myCercle()
        if de in [2, 3, 4, 5, 6]: #dé de 2, 3, 4, 5, 6 cercles
            if de != 2:
                for i in [1, 3]:    #dé de 3, 4, 5, 6 cercles
                    t.goto(nbcarre*(size+size/3)+size*i/4, i/4*size-cercleSize+posY)
                    myCercle()
            if de !=3:  #dé de 2, 4, 5, 6 cercles
                if de == 6: #dé de 6 cercles
                    for i in [1, 3]:
                        t.goto(nbcarre*(size+size/3)+size*i/4, size/2-cercleSize+posY)
                        myCercle()
                for i in [3,1]: #dé de 2, 4, 5, 6 cercles
                    t.goto(nbcarre*(size+size/3)+size*i/4,size-(i/4*size)-cercleSize+posY)
                    myCercle()

exitonclick()
"""