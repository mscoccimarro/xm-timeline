/*
Copyright (c) <2014> - Scoccimarro Maximiliano

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function($) {

	var defaults = {
		// General
		url: 'timeline-events.json',
		showCount: 2,
		loadCount: 1,
		animation: false,
		speed: 600,
		// Style
		line: '4px solid #d2d2d2'
		// Callbacks
	};

	$.fn.xmtimeline = function(options) {

		if(this.length == 0) return this;

		var tl = {},
			timeline = this,
			calendary = [],
			currIndex = 0,
			days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Novemeber', 'December'];

		/**
		 * Initializes and validates namespace settings
		 */
		 var init = function() {
		 	// merge settings
			tl.settings = $.extend({}, defaults, options);
			timeline.addClass('xmtimeline');
			// fetch timeline events
			fetchCalendary();
		 };

		 /**
		 * Fetches timeline events from JSON file
		 */
		 var fetchCalendary = function() {
			$.ajax({
				url: tl.settings.url,
				dataType: "json",
				contentType: 'application/json',
				success: createTimeline
			});
		 };

		 /**
		 * Converts date to string format
		 */
		 var parseDate = function() {
		 	var day = calendary[currIndex].date.day,
		 		month = calendary[currIndex].date.month,
		 		year = calendary[currIndex].date.year,
		 		date = new Date(year, month-1, day);

		 	// add day suffix
		 	day += nth(day);

		 	return [days[date.getDay()], months[month-1], day];
		 };

		/**
		* Gets day corresponding suffix
		*/
		var nth = function(day) {
			if(day>3 && day<21) return 'th';
			switch (day % 10) {
				case 1:  return "st";
			    case 2:  return "nd";
			    case 3:  return "rd";
			    default: return "th";
		  	}
		};

		/**
		* Create timeline, limit to showCount
		*/
		var createTimeline = function(data) {
			calendary = data;
			// create timeline
			insertDays(tl.settings.showCount);
		};

		/**
		* Returns boolean indicating days left to process
		*/
		var daysLeft = function() {
			return calendary.length > currIndex;
		};

		/**
		* Show timeline events using set animation
		*/
		var showEvents = function() {
			$('.xmtimeline .event').each(function() {
		        var a = $(this).offset().top + ($(this).outerHeight()/3),
		        	b = $(window).scrollTop() + $(window).height();
		        if (a < b) 
		        	playAnimation($(this));
		    });
		};

		/**
		* Set animation initial state on element argument
		*/
		var setAnimation = function(element) {
			switch(tl.settings.animation) {
        		case 'fade': {
        			element.css('visibility', 'hidden');
        			element.css('opacity', 0);
        			break;
        		}
        		case 'slide':
        		case 'scale': {
        			element.css('opacity', 0);
        			break;
        		}
	        }
		};

		/**
		* Execute animation on element argument
		*/
		var playAnimation = function(element) {
			switch(tl.settings.animation) {
        		case 'fade': {
        			element.css('visibility', 'visible');
        			element.animate({'opacity': 1}, tl.settings.speed);
        			break;
        		}
        		case 'slide': {
        			if(element.hasClass('left'))
        				element.addClass('slide-l');
        			if(element.hasClass('right'))
        				element.addClass('slide-r');
        			break;
        		}
        		case 'scale': {
        			element.addClass('scale');
        			break;
        		}
        		case false: return;
        	}
		};

		/**
		* Inserts loader on timeline
		*/
		var insertLoader = function() {
			var $loader = $('<div>', {'class': 'loader'});
				$loader.text('Load More');
			if(daysLeft()) {
				$loader.bind('click', function() {
					$(this).remove();
					insertDays(tl.settings.loadCount);
				});
			} else {
				$loader
					.text('No More Events')
					.addClass('end');
			}
			timeline.append($loader);
		};

		/**
		* Loops timeline structure by count
		*/
		var insertDays = function(count) {
			var itemsLeft = calendary.length - currIndex;
			if(itemsLeft > count)
				itemsLeft = count;
			for(var i=0; i<itemsLeft; i++)
				insertDay();
			showEvents();
			insertLoader();
		};

		/**
		* Inserts timeline structure
		*/
		var insertDay = function() {
		 	// date
		 	insertDate();

		 	var $cleaner = $('<div>');
			$cleaner.css('clear', 'both');

		 	// columns
		 	var $columnContainer = $('<div>', {'class': 'column-wrap'}),
		 		$leftColumn = $('<div>', {'class': 'column left'}),
		 		$rightColumn = $('<div>', {'class': 'column right'});

	 		// set timeline line
	 		$leftColumn.css('borderRight', tl.settings.line);

	 		// insert columns
	 		$columnContainer.append($leftColumn, $rightColumn);
	 		timeline.append($columnContainer);

		 	var eventCount = calendary[currIndex].events.length,
		 		first = true, side, once = true;

		 	// process events
		 	for(var i=0; i<eventCount; i++) {
		 		var	currEvent = calendary[currIndex].events[i],
		 			$eventContainer = $('<div>', {'class': 'event'}),
		 			$eventBullet = $('<div>', {'class': 'bullet '+ currEvent.bullet}),
		 			$eventTime = $('<div>', {'class': 'time'}),
		 			$eventTimeArrow = $('<div>', {'class': 'arrow'}),
		 			$eventBody = $('<div>', {'class': 'body'}),
		 			$eventContent = $('<div>', {'class': 'content'});
		 			
		 		// set animation for event
		 		setAnimation($eventContainer);

		 		if(first) {
		 			side = currEvent.side;
		 			first = false;
		 		}
		 		if(currEvent.side != side && once) {
		 			$eventContainer.addClass('first');
		 			once = false;
		 		}

		 		// set event time
		 		var $time = $('<div>', {'class': 'value'}),
		 			minutes = currEvent.time.minutes;
		 		if(minutes == 0)
		 			minutes = '00';	 		
		 		if(currEvent.time.am)
		 			$time.text(currEvent.time.hours +':'+ minutes +' AM');
		 		if(currEvent.time.pm)
		 			$time.text(currEvent.time.hours +':'+ minutes +' PM');

		 		// insert event time
		 		$eventTime.append($time);
		 		// insert event bullet
		 		$eventTime.append($eventBullet);

		 		if(currEvent.side == 'left')
		 			$eventTimeArrow.addClass('right');

		 		if(currEvent.side == 'right')
		 			$eventTimeArrow.addClass('left');

		 		$eventTime.append($eventTimeArrow);

		 		// set media
		 		var media = false;
		 		// process image if set
		 		if(currEvent.image) 
		 			media = '<img src="'+ currEvent.image +'" alt="event-image">';
		 		// process video if set
		 		if(currEvent.video) 			
		 			media = currEvent.video;
		 		// insert media
		 		$eventBody.append(media);

		 		// set event content
		 		for(var j=0; j<currEvent.items.length; j++) {
		 			var $title = $('<h5>', {'class': 'title'}),
			 			$subtitle = $('<h6>', {'class': 'subtitle'}),
			 			$description = $('<p>', {'class': 'description'});
			 		// set body title
			 		$title.text(currEvent.items[j].title);
			 		// insert body title
			 		$eventContent.append($title);

			 		// set body subtitle
			 		$subtitle.text(currEvent.items[j].subtitle);
			 		// insert body subtitle
			 		$eventContent.append($subtitle);

			 		// set body description
			 		if(currEvent.items[j].description) {
			 			$description.text(currEvent.items[j].description);
			 			// insert body description
			 			$eventContent.append($description);
			 		}

			 		// insert item
			 		$eventBody.append($eventContent);
		 		}
		 		
		 		// fill event container
		 		$eventContainer.append($eventTime, $eventBody);

		 		// insert event
		 		if(currEvent.side == 'left') {
		 			$eventContainer.addClass('left');
		 			$leftColumn.append($eventContainer);
		 		} else if(currEvent.side == 'right') {
		 			$eventContainer.addClass('right');
		 			$rightColumn.append($eventContainer);	
		 		}
		 	}

			timeline.append($cleaner);
			currIndex++;
		};

		/**
		* Inserts date on timeline
		*/
		var insertDate = function() {
			var date = parseDate(),
			 	$date = $('<div>', {'class': 'date'});
			$date.text(date[0] +', '+ date[1] +' '+ date[2]);
		 	timeline.append($date);
		};

		init();
		// show events when scrolling
		$(document).bind('scroll', showEvents);

		return this;
	};
})(jQuery);