from turtle import setworldcoordinates, Turtle, exitonclick, title, tracer

nbcarre = int(input('nb carré sur un côté :\t'))
size = 1
isBLUE=True
setworldcoordinates(0,0,size*nbcarre,size*nbcarre)
t = Turtle()
t.speed(0)
t.penup()

for i in range(nbcarre):
    t.goto(0,i*size)
    for _ in range(nbcarre):
        if isBLUE:
            t.fillcolor('blue')
        else:
            t.fillcolor('red')
        t.begin_fill()
        for _ in range(4):
            t.forward(size)
            t.left(90)
        t.end_fill()
        isBLUE = not isBLUE
        t.forward(size)
    isBLUE = not isBLUE

exitonclick()