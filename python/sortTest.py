from math import log2

def fusion(a, b):
    if not a:
        return b
    if not b : 
        return a 
    if a[0]<= b[0]:
        return [a[0]]+fusion(a[1:], b)
    return [b[0]]+fusion(a, b[1:])

def trifusion(array):
    if len(array) <= 1:
        return array
    return fusion(trifusion(array[:int(len(array)/2)]), trifusion(array[int(len(array)/2):]))


def triBubble(array : list):
    while True:
        Sorted = True
        for i in range(len(array)-1):
            if array[i]>array[i+1]:
                Sorted = False
                array[i], array[i+1]  = array[i+1], array[i]
        if Sorted :
            return array


def MinAndMax(array : list):
    mini = 0
    maxi = 0
    for i in range(1, len(array)):
        if array[mini]>array[i]:
            mini = i
        elif array[maxi]<array[i]:
            maxi = i
    return (mini, maxi)

def triMinAndMax(array : list):
    new_array = []
    for i in range(int(len(array)/2)+(1 if len(array)%2 !=0 else 0)):
        mini, maxi = MinAndMax(array)
        new_array.insert(i, array.pop(mini))
        try:
            new_array.insert(len(new_array)-i, array.pop(maxi-1) if mini<maxi else array.pop(maxi))
        except:
            break
    return new_array

def triBitonic(array : list):#had to be at power of two
    for k in (2**p for p in range(1, int(log2(len(array))+1))):
        j = int(k/2)
        while j > 0:
            for i in range(len(array)):
                l = i ^ j
                if l>i:
                    if (i&k == 0) and (array[i]>array[l]) or (i&k != 0) and (array[i]<array[l]):
                        array[i], array[l] = array[l], array[i]
            j = int(j/2)
    return array


def countingSort(array : list):
    size = len(array)
    mini, maxi = min(array), max(array)
    output = [0]*size
    count = [0]*(maxi-mini+1)
    for i in range(size):
        count[array[i]-mini] += 1
    poss = 0
    for i in range(len(count)):
        for _ in range(count[i]):
            output[poss] = i+mini
            poss += 1
    return output
