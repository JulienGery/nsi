#define BUTTON 2

bool passed = false;
int count = 0;
int timePassed;
int timeLoop;
bool button;
bool previusButton;
int timeLongPress;


void setup() {
  Serial.begin(115200);
  pinMode(BUTTON, INPUT);

}

void loop() {
  timeLoop = millis()/1000;
  button = digitalRead(BUTTON);
  if(button && previusButton!=button){
    // Serial.print("count ++");
    count++;
  }else if (button){
    timePassed = millis()/1000;
    passed = true;
  }
  if(timeLoop-timePassed >= 2 && passed){
    // Serial.println(count);
  }
  previusButton = button;
  delay(50);
}
