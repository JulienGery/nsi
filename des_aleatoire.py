from turtle import Turtle, exitonclick, setworldcoordinates
from random import randint

size = 1 #valeur sans importance doit être != 0
cercleSize = size/10 #/6 est la taille max avant les problèmes /8 est pas mal /10 peut être meilleur
tirage = int(input('tirage:\t'))
racineTirage = int(tirage**(1/2))
rows = [racineTirage+2]*(tirage-(racineTirage+1)*(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage))-(racineTirage+((tirage-racineTirage**2)//racineTirage))*(racineTirage-(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage))))+[racineTirage+1]*(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage)-(tirage-(racineTirage+1)*(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage))-(racineTirage+((tirage-racineTirage**2)//racineTirage))*(racineTirage-(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage))))) + [tirage//racineTirage]*(racineTirage-(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage)))  #création du tableau/"matrice"
setworldcoordinates(0, 0, max(rows[0], len(rows))*(size+size/3), max(rows[0], len(rows))*(size+size/3)) #ajustement de la taille de la carte
t = Turtle()#création de la tortue
t.speed(0)
t.fillcolor('red')

for row in range(len(rows)):
    posY = (size+size/3)*row   #position sur l'axe y. peut être supprimer pour gagner 1 ligne
    for nbcarre in range(rows[row]):    #création de la ligne. nbcarre est le numéro du carré en cour sur la rangée

        posX = nbcarre*(size+size/3)  #position sur l'axe x. peut être supprimer pour gagner 1 ligne
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

#old rows = [racineTirage+1]*(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage)) + [racineTirage+((tirage-racineTirage**2)//racineTirage)]*(racineTirage-(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage))) + [tirage-(racineTirage+1)*(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage))-(racineTirage+((tirage-racineTirage**2)//racineTirage))*(racineTirage-(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage)))]
# using def can be improved. 50 lignes threaded

"""
from turtle import Turtle, exitonclick, setworldcoordinates
from random import randint
from threading import Thread

size = 1 #valeur sans importance doit être != 0
cercleSize = size/10 #/6 est la taille max avant les problèmes /8 est pas mal /10 peut être meilleur
tirage = int(input('tirage:\t'))
racineTirage = int(tirage**(1/2))
rows = [racineTirage+2]*(tirage-(racineTirage+1)*(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage))-(racineTirage+((tirage-racineTirage**2)//racineTirage))*(racineTirage-(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage))))+[racineTirage+1]*(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage)-(tirage-(racineTirage+1)*(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage))-(racineTirage+((tirage-racineTirage**2)//racineTirage))*(racineTirage-(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage))))) + [tirage//racineTirage]*(racineTirage-(tirage-racineTirage**2-racineTirage*((tirage-racineTirage**2)//racineTirage)))  #création du tableau/"matrice"
setworldcoordinates(0, 0, max(rows[0], len(rows))*(size+size/3), max(rows[0], len(rows))*(size+size/3)) #ajustement de la taille de la carte


def myCircle(turtle):
    turtle.begin_fill()
    turtle.circle(cercleSize)
    turtle.end_fill()

def myRow(turtle, posY, row):
    turtle.penup()
    for nbcarre in range(row):    #création de la ligne. nbcarre est le numéro du carré en cour sur la rangée
        posX = nbcarre*(size+size/3)  #position sur l'axe x. peut être supprimer pour gagner 1 ligne
        turtle.goto(posX, posY)
        turtle.pendown()
        de = randint(1,6)   #numéro du dé
        for _ in range(4):  #création du carré
            turtle.forward(size)
            turtle.left(90)
        turtle.penup()
        if de in [1, 3, 5]: #dé de 1, 3, 5 cercles équivalent  équivalent: if de == 1 or de == 3 or de == 5:. 
            turtle.goto(posX+size/2,(size/2)-(cercleSize)+posY)
            myCircle(turtle)
        if de in [2, 3, 4, 5, 6]: #dé de 2, 3, 4, 5, 6 cercles équivalent : if de == 2 or de == 3 or de == 4 or de == 5 or de == 6:.
            if de != 2:
                for i in [1, 3]:    #dé de 3, 4, 5, 6 cercles équivalent : for i in range(1, 3):
                    turtle.goto(posX+size*i/4, i/4*size-cercleSize+posY)
                    myCircle(turtle)
            if de !=3:  #dé de 2, 4, 5, 6 cercles
                if de == 6: #dé de 6 cercles
                    for i in [1, 3]: #équivalent for i in range(1, 3):
                        turtle.goto(posX+size*i/4, size/2-cercleSize+posY)
                        myCircle(turtle)
                for i in [3,1]: #dé de 2, 4, 5, 6 cercles équivalent : for i in range(3, 0, -1):
                    turtle.goto(posX+size*i/4,size-(i/4*size)-cercleSize+posY)
                    myCircle(turtle)

for row in range(len(rows)):
    posY = (size+size/3)*row   #position sur l'axe y. peut être supprimer pour gagner 1 ligne
    t = Turtle()#création de la tortue
    t.speed(0)
    t.fillcolor('red')
    thread = Thread(target=(myRow), args=(t, posY, rows[row]), daemon=True)
    thread.start()

exitonclick()
"""