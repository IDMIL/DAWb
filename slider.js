class slider{
  button;
  slider;
  constructor(){
  }

  setup(p, settings){
    // should be overridden to set up the slider
  }
  updateValue(p){
  this.settings[this.propName] = this.slider.value();
  this.displayVal = this.calcDisplayVal();
  // console.log(this.displayVal);
  this.textBox.value(this.displayVal);
  this.textLabel.html(this.name+': ');
  }

  makeSlider(p){
    this.slider = p.createSlider(this.min, this.max, this.initial, this.step);
    this.textLabel = p.createP();
    this.slider.input(p.draw);
    this.slider.mousePressed(p.draw);
    this.slider.mouseReleased(p.draw);
    this.textBox = p.createInput();
    this.textBox.size(50);
    this.button = p.createButton("Update");
    this.button.mousePressed(this.buttonPressed.bind(this));
    this.button.mouseReleased(p.draw);
  }

  resize(x, y, w, p){
    let width = w - 20;
    let labelWidth = 200;
    width -= labelWidth;
    let sliderWidth = width * 0.8;
    width -= sliderWidth;
    let textboxWidth = width * 0.5;
    width -= textboxWidth;
    let buttonWidth = width;

    this.slider.style('width', Math.round(sliderWidth).toString() + "px");
    this.slider.position(x, y);
    this.textLabel.position(x + this.slider.width + 10, y - 15);
    this.textBox.position(x+this.slider.width + labelWidth,y);
    this.textBox.style('width', Math.round(textboxWidth).toString() + "px");
    this.button.position(this.textBox.x+this.textBox.width+5,y);
    this.button.style('width', Math.round(buttonWidth).toString() + "px");
  }
  buttonPressed(){
    this.slider.value(this.textBox.value());  }

  calcSliderVal(){
    // override this with any calculations needed to convert textbox val to slider val (%, etc)
    return this.textBox.value();
  }
  calcDisplayVal(){
    // override this with any calculations needed to convert stored variable to display val (%, etc)
    return this.settings[this.propName];
  }
}


class freqSlider extends slider{
  setup(p,settings){
    this.settings = settings;
    this.name ="Fundamental Frequency";
    this.propName = "fundFreq";
    this.min = 0;
    this.max = this.settings.sampleRate / 2 ;
    this.initial = 100;
    this.step = 1.0;
    this.displayVal = this.initial;
    this.makeSlider(p);
  }

}

class numHarmSlider extends slider{
  setup(p,settings){
    this.settings = settings;
    this.name ="Number of Harmonics";
    this.propName="numHarm"
    this.min = 1;
    this.max = 10;
    this.initial = 1;
    this.step = 1;
    this.displayVal = this.initial;

    this.makeSlider(p);
  }

}

class sampleRateSlider extends slider{
  setup(p,settings){
    this.settings = settings;
    this.name ="Sample Rate";
    this.propName="downsamplingFactor";
    this.min = p.log(3000)/p.log(2);
    this.max =  p.log(48000)/p.log(2);
    this.initial = p.log(48000)/p.log(2);
    this.step = 0.1
    this.makeSlider(p);
  }
  // calcDisplayVal(){
  //   this.displayVal = p.round(this.settings.sampleRate / this.settings.downsamplingFactor / 1000, 3);
  // }
  updateValue(p){
    this.settings.downsamplingFactor = p.round(WEBAUDIO_MAX_SAMPLERATE/p.pow(2, this.slider.value()));
    this.textBox.value(p.round(this.settings.sampleRate / this.settings.downsamplingFactor / 1000, 3)+" Khz");//
    this.textLabel.html('Sample Rate: ');// + p.round(this.settings.sampleRate / this.settings.downsamplingFactor / 1000, 3) + " kHz")
  }
}

class ditherSlider extends slider {
  setup(p,settings){
    this.settings = settings;
    this.name ="Dither";
    this.propName="dither";
    this.min = 0.0;
    this.max =  1.0;
    this.initial = 0.0;
    this.step = 0.01;
    this.makeSlider(p);
  }

}

class bitDepthSlider extends slider {
  setup(p,settings){
    this.settings = settings;
    this.name ="Bit Depth";
    this.propName = "bitDepth";
    this.min = 1;
    this.max =  BIT_DEPTH_MAX;
    this.initial = BIT_DEPTH_MAX;
    this.step = 1;
    this.makeSlider(p);
  }

}

class amplitudeSlider extends slider {
  setup(p,settings){
    this.settings = settings;
    this.propName ="amplitude";
    this.name = "Amplitude";
    this.min = 0.0;
    this.max =  1.0;
    this.initial = 1.0;
    this.step = 0.01;
    this.makeSlider(p);
  }

}

class antialiasingSlider extends slider {
  setup(p, settings){
    this.settings = settings;
    this.propName ="antialiasing";
    this.name = "Antialiasing";
    this.min = 0.0;
    this.max =  200;
    this.initial = 0;
    this.step = 10;
    this.makeSlider(p);
  }
}

class phaseSlider extends slider{
  setup(p,settings){
    this.settings = settings;
    this.propName ="phase";
    this.name = "Phase";
    this.min = 0;
    this.max =  2; //pi
    this.initial = 0.0;
    this.step = .001; //pi/8
    this.makeSlider(p);
}
  updateValue(p){
    let sliderVal = this.slider.value();
    this.settings.phase = sliderVal * Math.PI;
    this.textBox.value(this.settings.phase.toFixed(3) + '*PI');
    this.textLabel.html(this.name +": ");
  }
}

class ampZoomSlider extends slider{
  setup(p,settings){
    this.settings = settings;
    this.name ="Amp. Zoom";
    this.propName="ampZoom";
    this.min = .5;
    this.max = 4.0; //pi
    this.initial =1.0;
    this.step = .01; //pi/8
    this.makeSlider(p);
}
calcDisplayVal(){return this.settings[this.propName]*100 + "%";}

}
class timeZoomSlider extends slider{
  setup(p,settings){
    this.settings = settings;
    this.propName ="timeZoom";
    this.name = "Time zoom"
    this.min = .5;
    this.max =  2;
    this.initial = 1.0;
    this.step = .01;
    this.makeSlider(p);
}
calcDisplayVal(){return this.settings[this.propName]*100 + "%";}

}
class freqZoomSlider extends slider{
  setup(p,settings){
    this.settings = settings;
    this.propName ="freqZoom";
    this.min = .5;
    this.max =  5;
    this.initial = 1.0;
    this.step = .01;
    this.makeSlider(p);
}
updateValue(p){
  this.settings.freqZoom = this.slider.value();
  this.settings.maxVisibleFrequency = WEBAUDIO_MAX_SAMPLERATE/2/this.settings.freqZoom;
  this.textBox.value(this.settings.freqZoom*100 + "%");
  this.textLabel.html('Freq zoom: ');
  }
}
