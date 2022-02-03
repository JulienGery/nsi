const int digitPorts[] = {2, 3, 4, 5, 6, 7, 8, 9};
//2 point, 3 bas droite, 4 bas , 5 bas gauche, 6 haut droite, 7 haut, 8 haut gauche 9 millieu

const int size = 10;
const int numbers[size][8] = {
  {0,1,1,1,1,1,1,0},
  {0,1,0,0,1,0,0,0},
  {0,0,1,1,1,1,0,1},
  {0,1,1,0,1,1,0,1},
  {0,1,0,0,1,0,1,1},
  {0,1,1,0,0,1,1,1},
  {0,1,1,1,0,1,1,1},
  {0,1,0,0,1,1,0,0},
  {0,1,1,1,1,1,1,1},
  {0,1,1,0,1,1,1,1}
};

void setup() {
  Serial.begin(115200);
  for(auto i : digitPorts){
    pinMode(i, OUTPUT);
    digitalWrite(i, HIGH);
  }
}

void loop() {
  for(int i = 0; i<size; i++){
    for(int j = 0; j<sizeof(digitPorts)/sizeof(*digitPorts); j++){
      digitalWrite(digitPorts[j],not numbers[size-1-i][j]);
    }
    delay(500);
  }
}
