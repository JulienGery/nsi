from turtle import setworldcoordinates, Turtle, exitonclick

nbcarre = int(input('nb carré sur un côté :\t'))
size = 1
isBlue=True
setworldcoordinates(0,0,size*nbcarre,size*nbcarre)
t = Turtle()
t.speed(0)
t.penup()

for i in range(nbcarre):
    t.goto(0,i*size)
    for _ in range(nbcarre):
        if isBlue:
            t.fillcolor('blue')
        else:
            t.fillcolor('red')
        t.begin_fill()
        for _ in range(4):
            t.forward(size)
            t.left(90)
        t.end_fill()
        isBlue = not isBlue
        t.forward(size)
    isBlue = not isBlue

exitonclick()
