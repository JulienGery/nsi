const int Ports[] = {2, 3};


void setup() {
  Serial.begin(115200);
  for(auto &i : Ports){
    pinMode(i, OUTPUT);
  }
  
}

void loop() {
  const float BETA = 3950; 
  int analogValue = analogRead(A0);
  float celsius = 1 / (log(1 / (1023. / analogValue - 1)) / BETA + 1.0 / 298.15) - 273.15;
  Serial.println(celsius);
  if(celsius >= 25){
   digitalWrite(2, HIGH);
   digitalWrite(3, LOW);
  }else{
    digitalWrite(2, LOW);
    digitalWrite(3, HIGH);
  }
  delay(500);
}
