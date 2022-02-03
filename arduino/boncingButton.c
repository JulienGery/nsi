#define BUTTON 2


void check(){
  int boucle = 0;
  while(boucle<10){
    boucle++;
    if(digitalRead(BUTTON)){
      boucle = 0;
    }
    delay(1);
  }
}

int getData(){
  check();
  while(true){
    if(digitalRead(BUTTON)){
      return 1;
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON, INPUT);
}

void loop() {
  Serial.println(getData());
}