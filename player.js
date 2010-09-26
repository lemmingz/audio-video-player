var makeSound = new Class({
	Implements: Log,
	initialize: function(){
		this.enableLog().log('Initializing test');
	},
	check: function(){
		var allAudio = $(document.body).getElements('audio');
		if($defined(allAudio)){
		
			if (Modernizr.audio){
				this.controls(allAudio);
			}else if(Browser.Plugins.Flash.version > 9){
				this.fallback(allAudio);
			}
		}
	},
	
	controls: function(audioTags){
		$each(audioTags, function(player, index){
			var buttons = new Element('div',{'class':'buttons'}).inject(player,'after');
			
			/* Play/Pause Button */
			var playpause = new Element('button', {'id':'ap_'+index+'_playpause','html':'&#x25BA;','title':'Play'}).inject(buttons);
			playpause.addEvent('click', function(){
				if(player.paused){
					player.play();
					player.fireEvent('play');
					this.set({'html':'&#x2016;','title':'Pause'});
				} else {
					player.pause();
					player.fireEvent('pause');
					this.set({'html':'&#x25BA;','title':'Play'});
				}
			});
			
			/* Mute Button */
			var mute = new Element('button', {'id':'ap_'+index+'_mute','text':'Mute','title':'Mute'}).inject(buttons);
			mute.addEvent('click', function(){
				if(player.muted){
					player.muted = false;
				} else {
					player.muted = true;
				}
			});
			
			/* Show Time */
			var remaining = new Element('button', {'id':'ap_'+index+'_remain','html':secToTime(player.duration).m + ':' + secToTime(player.duration).s}).inject(buttons);
			
			/* Duration Bar */
  			var time_leiste = new Element('div',{'class':'time-slider','id':'ap_'+index+'_time'}).inject(buttons);
			var time_knopf = new Element('div',{'class':'knob'}).inject(time_leiste);
			var timeSlider = new Slider(time_leiste, time_knopf, {
				range: [0,player.duration],
				onChange: function(wert){
					//player.currentTime = wert;
					var pos = this.step;
				}
			}).set(0); 			
			var timer = function(){
				timeSlider.set(player.currentTime);
				remaining.set({'html':secToTime(player.currentTime).m + ':' + secToTime(player.currentTime).s});
			};
			
			function secToTime(a){
				var hours=Math.floor(a/3600); 
				var minutes=Math.floor(a/60)-(hours*60); 
				var seconds=Math.floor(a-(hours*3600)-(minutes*60)); 
				if(seconds < 10){
					seconds = '0' + seconds
				}
				
				var obj = {
					"h": hours,
					"m": minutes,
					"s": seconds
				};
				return obj;
			};
			
			player.addEvent('play', function(){
				timer.periodical(200);
			});
			player.addEvent('pause', function(){
				clearInterval(timer);
			}); 
			
			/* Volume Bar */
			var vol_leiste = new Element('div',{'class':'volume-slider','id':'ap_'+index+'_volume'}).inject(buttons);
			var vol_knopf = new Element('div',{'class':'knob'}).inject(vol_leiste);
			var volumeSlider = new Slider(vol_leiste, vol_knopf, {
				mode: 'vertical',
				onChange: function(wert){
					player.volume = (1 - (this.step / 100));
				}
			}).set(70);
			/* remove default player */
			/* player.erase('controls'); */
		});
	},
	
	/* Fallback uses the flash player from http://wpaudioplayer.com/standalone */
	fallback: function(audioTags){
 		new Element('script', { 'src':'audio/flashplayer/audio-player.js'}).inject($$('head')[0]);
		AudioPlayer.setup('audio/flashplayer/player.swf', {  
			width: 290,
			transparentpagebg: "yes"
		});
		$each(audioTags, function(audio, index){
			audio.set('id','ap_'+index);
			var file = audio.getElements('source')[1].get('src');
			AudioPlayer.embed('ap_'+index, {soundFile: file});				
		});
	}
});

window.addEvent('domready',function(){
	var mySound = new makeSound;
	mySound.check();
});