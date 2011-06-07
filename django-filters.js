if(!window['django']) {
    window['django'] = {};
    var django = window['django'];
}

(function(){
    if(!django.filters) {
        django.filters  =   {};
    }
    
    django.filters.utils   =   {
        // borrowed from jQuery
        'trim': typeof String.prototype.trim ?  function( text ) {
                            return text == null ? "" : String.prototype.trim.call( text );
                        } : 
                        function( text ) {
                            return text == null ? "" : text.toString().replace(/^\s+/, "").replace(/\s+$/, "");
                        },
        // borrowed from jQuery
        'inArray':      function( elem, array ) {
                    		if ( Array.prototype.indexOf ) {
                    			return Array.prototype.indexOf.call( array, elem );
                    		}

                    		for ( var i = 0, length = array.length; i < length; i++ ) {
                    			if ( array[ i ] === elem ) {
                    				return i;
                    			}
                    		}

                    		return -1;
    	                },
    	'l_pad':        function(obj, len, pad) {
                            obj =   obj.toString();
                            pad =   pad.toString();
                            var padding =   "";
                            while(padding.length < len) {
                                padding =   pad + padding;
                            }
                            obj =   padding.substr(0, len - obj.length) + obj;
                            return obj;
                        },
    	'r_pad':        function(obj, len, pad) {
                            obj =   obj.toString();
                            pad =   pad.toString();
                            while(obj.length < len) {
                                obj =   obj + pad;
                            }
                            obj =   obj.substr(0, len);
                            return obj;
                        }
        
    }
    
    var utils   =   django.filters.utils;

	django.filters.intcomma = function( number ) {
		var origNumber = number;
		number = parseInt( number, 10 );
		if( isNaN(number) ) {
			return origNumber;
		}
		numString = String( number );
		number = "";
		var loopCount = 0;
		for (var i = numString.length - 1; i >= 0; i--){
			number = ( loopCount % 3 === 2 && i > 0 ? ',' : '' ) + numString[i] + number;
			loopCount++;
		};
		return number;
	}

	django.filters.apnumber = function( number ) {
	    var origNumber  =   number;
		number = parseInt( number, 10 );
		if( isNaN(number) ) {
			return origNumber;
		}
		return django.filters.apnumber.numbers.current[number] || String(number);
	}

	django.filters.apnumber.numbers =   {
	    'en-us':    [
	        'zero',
	        'one',
	        'two',
	        'three',
	        'four',
	        'five',
	        'six',
	        'seven',
	        'eight',
	        'nine'
	    ]
	};
	django.filters.apnumber.numbers['en']   =   django.filters.apnumber.numbers['en-us'];
	if(navigator.language && django.filters.apnumber.numbers[navigator.language]) {
        django.filters.apnumber.numbers['current']  =   django.filters.apnumber.numbers[navigator.language];
    } else {
        django.filters.apnumber.numbers['current']  =   django.filters.apnumber.numbers['en-us'];
    }

	django.filters.apnumber_reverse = function( number ) {
	    var origNumber  =   number;
		number = utils.trim(number);
		for (var i = django.filters.apnumber.numbers.current.length - 1; i >= 0; i--) {
		    if(number == django.filters.apnumber.numbers.current[i]) {
		        return i;
		    }
		};
		number = parseInt( number, 10 );
		if( isNaN(number) ) {
		    number  =   origNumber;
		}
		return number;
	}
	
	django.filters.slugify = function( str, maxLength ) {
		str =   utils.trim(str).replace(/[^a-zA-Z0-9-._~]/g, '-').toLowerCase();
		if(maxLength && isFinite(maxLength)) {
		    str =   str.substr(0, maxLength);
		}
		return str.replace(/^-+/, '').replace(/-+$/, '').replace(/-+/g, '-');
	}
	
	django.filters.ordinal = function( number ) {
		var num = parseInt(number, 10);
		if(isNaN(num)) {
			return number;
		}
		number = num;

		var suffixes = {
		    'en-us': ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']
	    };
	    suffixes['en']  =   suffixes['en-us'];
	    if(navigator.language && suffixes[navigator.language]) {
            suffixes['current'] =   suffixes[navigator.language];
        } else {
            suffixes['current'] =   suffixes['en-us'];
        }
        
		if(utils.inArray(number % 100, [11, 12, 13]) > -1) {
			return [number, suffixes.current[0]].join('');
		}
		return [number, suffixes.current[number % 10]].join('');
	}
	
	django.filters.date =   function(date, format) {
	    /*
	        To escape a character, use '%'; to print a literal '%', use '%%'.
	        Otherwise, formatting follows https://docs.djangoproject.com/en/1.3/ref/templates/builtins/#date.
	    */
	    if(!date || ( date.toString && date.toString().toLowerCase() == 'invalid date' )) {
	        return date;
	    }
        format      =   format || django.filters.date.defaultFormats.date;
	    var jan1    =   new Date(date.getFullYear(), 0, 1);
	    
	    function normalize12Hours(hours) {
	        if(hours > 12) {
	            hours   =   hours - 12;
	        } else if(hours === 0) {
	            hours   =   12;
	        }
	        return hours;
	    }

        var formats =   {
            'a':    (date.getHours() < 12 ? django.filters.date.meridians.current.ap.am : django.filters.date.meridians.current.ap.pm),
            'A':    (date.getHours() < 12 ? django.filters.date.meridians.current.normal.am : django.filters.date.meridians.current.normal.pm),
            'b':    django.filters.date.months.current.short[date.getMonth()].toLowerCase(),
            'd':    utils.l_pad(date.getDate(), 2, 0),
            'D':    django.filters.date.days.current.short[date.getDay()],
            'E':    (django.filters.date.months.current.locale ? django.filters.date.months.current.locale[date.getMonth()] : django.filters.date.months.current.long[date.getMonth()]),
            'f':    (function(date) {
                        var ret =   [normalize12Hours(date.getHours())];
                        if(date.getMinutes() !== 0) {
                            ret.push(':');
                            ret.push(utils.l_pad(date.getMinutes(), 2, 0));
                        }
                        return ret.join('');
                    })(date),
            'F':    django.filters.date.months.current.long[date.getMonth()],
            'g':    normalize12Hours(date.getHours()),
            'G':    date.getHours(),
            'h':    utils.l_pad(normalize12Hours(date.getHours()), 2, 0),
            'H':    utils.l_pad(date.getHours(), 2, 0),
            'i':    utils.l_pad(date.getMinutes(), 2, 0),
            'j':    date.getDate(),
            'l':    django.filters.date.days.current.long[date.getDay()],
            'L':    Boolean(new Date(date.getFullYear(), 1, 29).getDate() == 29),
            'm':    utils.l_pad(date.getMonth() + 1, 2, 0),
            'M':    django.filters.date.months.current.short[date.getMonth()],
            'n':    date.getMonth() + 1,
            'N':    django.filters.date.months.current.ap[date.getMonth()],
            'O':    (function(date) {
                        var offsetHours     =   Math.ceil(date.getTimezoneOffset() / 60),
                            offsetMinutes   =   date.getTimezoneOffset() % 60;
                        return (offsetHours <= 0 ? '+' : '-') + utils.l_pad(offsetHours, 2, 0) + utils.l_pad(offsetMinutes, 2, 0);
                    })(date),
            'P':    (function(date) {
                        if((date.getHours() === 0 || date.getHours() === 12) && date.getMinutes() === 0) {
                            return django.filters.date.meridians.current.normal[date.getHours()];
                        }
                        var ret =   [normalize12Hours(date.getHours())];
                        if(date.getMinutes() !== 0) {
                            ret.push(':');
                            ret.push(utils.l_pad(date.getMinutes(), 2, 0));
                        }
                        ret.push(' ');
                        ret.push((date.getHours() < 12 ? django.filters.date.meridians.current.ap.am : django.filters.date.meridians.current.ap.pm));
                        return ret.join('');
                    })(date),
            's':    utils.l_pad(date.getSeconds(), 2, 0),
            'S':    django.filters.ordinal(date.getDate()).replace(date.getDate(), ''),
            't':    (32 - new Date(date.getYear(), date.getMonth(), 32).getDate()),
            'T':    (function(date) {
                        var timeString  =   date.toTimeString();
                        timeString      =   timeString.substring(timeString.indexOf('(') + 1, timeString.length - 1);
                        return timeString;
                    })(date),
            'u':    date.getMilliseconds() * 1000,
            'U':    Math.floor(date.getTime() / 1000),
            'w':    date.getDay(),
            'W':    (function(date) {
                        // based on http://www.meanfreepath.com/support/getting_iso_week.html
                        var newYearDoW  =   jan1.getDay();
                        newYearDoW      =   newYearDoW >= 0 ? newYearDoW : newYearDoW + 7;
                        var dayNum      =   Math.floor(
                                                (
                                                    date.getTime() - jan1.getTime() -
                                                    (
                                                        date.getTimezoneOffset() - jan1.getTimezoneOffset()
                                                    ) * 60000
                                                ) / 86400000
                                            ) + 1,
                            weekNum;
                        if(newYearDoW < 4) {
                            weekNum     =   Math.floor(
                                                (dayNum + newYearDoW - 1) / 7
                                            ) + 1;
                            if(weekNum > 52) {
                                newYearDoW  =   new Date(date.getFullYear() + 1, 0, 1).getDay();
                                newYearDoW  =   newYearDoW >= 0 ? newYearDoW : newYearDoW + 7;
                                weekNum =   newYearDoW < 4 ? 1 : 53;
                            }
                        } else {
                            weekNum     =   Math.floor(
                                                (dayNum + newYearDoW - 1) / 7
                                            );
                        }
                        return weekNum > 0 ? weekNum : 1;
                    })(date),
            'y':    date.getFullYear().toString().substr(2),
            'Y':    date.getFullYear(),
            'z':    Math.ceil( ( date - jan1 ) / 86400000 ),
            'Z':    (function(date) {
                        var offsetSeconds =   date.getTimezoneOffset() * 60 * -1;
                        return (offsetSeconds < 0 ? '-' : '') + utils.r_pad(Math.abs(offsetSeconds), 5, 0);
                    })(date)
        }
        // special cases
        // ISO 8601
        //                   YYYY            MM              DD              HH              MM              SS              mmmmmm
        formats['c']    =   [formats.Y, '-', formats.m, '-', formats.d, 'T', formats.H, ':', formats.i, ':', formats.s, '.', utils.l_pad(formats.u, 6, 0)].join('');
        // RFC 2822
        //                   Short Day        Date            Short Month     Year            HH              MM              SS              Timezone Offset
        formats['r']    =   [formats.D, ', ', formats.j, ' ', formats.M, ' ', formats.Y, ' ', formats.H, ':', formats.i, ':', formats.s, ' ', formats.O].join('');
        
        format  =   format.split('');
        format.reverse();
        var ret     =   [],
            lastChar;
        for (var i = format.length - 1; i >= 0; i--) {
            var f   =   format[i];
            if(lastChar === '%' || f === '%') {
                if(lastChar === '%') {
                    ret.push(f);
                }
                lastChar    =   f;
                continue;
            }
            ret.push(f in formats ? formats[f] : f);
        };
        if(ret.length === 1 && typeof ret[0] === 'boolean') {
            return ret[0];
        }
        return ret.join('');
	}
	
	django.filters.time =   function(date, format) {
	    return django.filters.date(date, format || django.filters.date.defaultFormats.time);
	}
	
	django.filters.date.defaultFormats  =   {
	    'date':     'N j, Y',
	    'time':     'P'
	}
	
	django.filters.date.months  =   {
        'en-us': {
	        'long': [
	            'January',
	            'February',
	            'March',
	            'April',
	            'May',
	            'June',
	            'July',
	            'August',
	            'September',
	            'October',
	            'November',
	            'December'
	        ],
	        'short': [
	            'Jan',
	            'Feb',
	            'Mar',
	            'Apr',
	            'May',
	            'Jun',
	            'Jul',
	            'Aug',
	            'Sep',
	            'Oct',
	            'Nov',
	            'Dec'
	        ],
	        'ap': [
	            'Jan.',
	            'Feb.',
	            'March',
	            'April',
	            'May',
	            'June',
	            'July',
	            'Aug.',
	            'Sept.',
	            'Oct.',
	            'Nov.',
	            'Dec.'
	        ]
        }
    };
    
    django.filters.date.days        =   {
        'en-us': {
            'long': [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday'
            ],
            'short': [
                'Sun',
                'Mon',
                'Tue',
                'Wed',
                'Thu',
                'Fri',
                'Sat'
            ]
        }
    };
    
    django.filters.date.meridians    =   {
        'en-us': {
            'ap': {
                'am': 'a.m.',
                'pm': 'p.m.'
            },
            'normal': {
                'am': 'AM',
                'pm': 'PM',
                0: 'midnight',
                12: 'noon'
            }
        }
    };

    var translatable    =   ['months', 'meridians', 'days'];
    for (var i = translatable.length - 1; i >= 0; i--) {
        var group    =   django.filters.date[translatable[i]];
        if(group['en-us']) {
            group['en']  =   group['en-us'];
        }
        if(navigator.language && group[navigator.language]) {
            group['current'] =   group[navigator.language];
        } else {
            group['current'] =   group['en-us'];
        }
    };
    delete(translatable);
})();
