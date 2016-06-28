/* -*- mode:js; tab-width: 4; indent-tabs-mode: t; js-indent-level: 4 -*- */
'use strict';

////////////////////////////////////////////////////////////////////////////////
// extend pest.config
////////////////////////////////////////////////////////////////////////////////

app.config = app.config || {};

(function(ns, $, _){
    
    ////////////////////////////////////////////////////////////////////////////////
    // pest.config.templates.get('template-id') to get the compiled _ template
    ////////////////////////////////////////////////////////////////////////////////
    
    ns.templates = {
        get: function(key){
            var templ8 = this[key];
            var $templ8, text;
            if (templ8) {
                return templ8;
            }
            else {
                $templ8 = $('#' + key);
                if ($templ8.length === 1) {
                    this[$templ8.attr('id')] = text = _.template($templ8.html());
                    $templ8.remove();
                    return text;
                }
                else {
                    return undefined;
                }
            }
        }
    };
    
    ////////////////////////////////////////////////////////////////////////////////
    // pest.config.nodes.get('key') to get the dom node
    ////////////////////////////////////////////////////////////////////////////////
    
    ns.nodes = {
        get: function(key){
            if (this[key]) 
                return this[key]();
            else 
                return undefined;
        },
        root: function(){
            //return $('article[role="main"]').get(0);
            return $('body').get(0);
        }
    };
    
    // pest.config.lang.get(), returns 'en' or 'fr' based on html[lang] property
    ns.lang = {
        get: function(){
            return $('html').attr('lang');
        }
    };
    
    
    
	////////////////////////////////////////////////////////////////////////////////
	// Settings for accounting.js, http://josscrowcroft.github.com/accounting.js/
	////////////////////////////////////////////////////////////////////////////////
        

    ns.formatting = {
        en: {
            currencySettings: {
                currency: {
                    symbol: "$", // default currency symbol is '$'
                    format: { // controls output: %s = symbol, %v = value/number (can be object: see below)
                        pos: "%s%v",
                        neg: "-%s%v",
                        zero: "%s 0.00"
                    },
                    decimal: ".", // decimal point separator
                    thousand: ",", // thousands separator
                    precision: 2 // decimal places
                },
                number: {
                    precision: 0, // default precision on numbers is 0
                    thousand: ",",
                    decimal: "."
                }
            },
            percentSettings: {
                symbol: "%",
                precision: 2,
                thousand: ",",
                format: "%v %s"
            }
        },
        fr: {
            currencySettings: {
                currency: {
                    symbol: "$", // default currency symbol is '$'
                    format: { // controls output: %s = symbol, %v = value/number (can be object: see below)
                        pos: "%v %s",
                        neg: "-%v %s",
                        zero: "0 %s"
                    },
                    decimal: ",", // decimal point separator
                    thousand: " ", // thousands separator
                    precision: 2 // decimal places
                },
                number: {
                    precision: 0, // default precision on numbers is 0
                    thousand: " ",
                    decimal: ","
                }
            },
            percentSettings: {
                symbol: "%",
                precision: 0,
                thousand: " ",
                format: "%v %s"
            }
        },
        get: function(lang){
            if (!lang) 
                lang = ns.lang.get();
            if (lang !== 'fr') 
                lang = 'en';
            return this[lang];
        }
    };
    
    ////////////////////////////////////////////////////////////////////////////////
    // any urls for ajax calls
    ////////////////////////////////////////////////////////////////////////////////
    ns.environment = {
        get: function(){
        	if (((window.location.href).indexOf('localhost') > -1 || (window.location.href).indexOf('.local') > -1 || (window.location.href).indexOf(':8080') > -1 || (window.location.href).indexOf(':8000') > -1)) {
        		return 'development';
        	}else{
        		return 'production';
        	}
        }
    };
    
    ns.urls = {
        development: {
        	root: "/" + ns.lang.get() + "/",
        	game: "/" + ns.lang.get() + "/",
        	mobile: "http://bneufeld.local:8000/mobile/" + ns.lang.get() + "/",
        	socketIO: 'http://'+location.hostname+':8080',
        	bitlyRequestUrl: 'http://api.bitly.com/v3/shorten',
        	bitlyUser: 'brendanneufeld',
        	bitlyKey: 'R_79e9c605f90da27664e0704fbda87908',
        	mongoDb: '',
        	environment: 'development',
        	fb_app_id: '212029655613500',
        	tweetUrl: 'http://lvslugger.fatboxes.com/'+ns.lang.get()+'/'
        },
        staging: {
        	root: "/" + ns.lang.get() + "/",
        	game: "/" + ns.lang.get() + "/",
        	mobile: location.protocol+"//"+location.host+"//mobile/" + ns.lang.get() + "/",
        	socketIO: 'http://'+location.hostname+':8080',
        	bitlyRequestUrl: 'http://api.bitly.com/v3/shorten',
        	bitlyUser: 'brendanneufeld',
        	bitlyKey: 'R_79e9c605f90da27664e0704fbda87908',
        	mongoDb: '',
        	environment: 'staging',
        	fb_app_id: '650611834964955',
        	tweetUrl: 'http://lvslugger.fatboxes.com/'+ns.lang.get()+'/'
        },
        production: {
        	root: "/" + ns.lang.get() + "/",
        	game: "/" + ns.lang.get() + "/",
        	mobile: location.protocol+"//"+location.host+"/mobile/" + ns.lang.get() + "/",
        	socketIO: 'http://'+location.hostname+':8080',
        	bitlyRequestUrl: 'http://api.bitly.com/v3/shorten',
        	bitlyUser: 'brendanneufeld',
        	bitlyKey: 'R_79e9c605f90da27664e0704fbda87908',
        	mongoDb: '',
        	environment: 'production',
        	fb_app_id: '650611834964955',
        	tweetUrl: 'http://lvslugger.fatboxes.com/'+ns.lang.get()+'/'
        },
        webservice1: {
            service: '/services/context/service.ashx',
            app: 'PESTNISSAN',
            output: 'xml',
            action: 'GetVehicleConfigurations',
            contextPage: 'Landing',
            lang: ns.lang.get(),
			testUrl: "/buying/estimator/xml/GetVehicleConfigurations_leaf.xml",
			test: false
        },
        webservice2: {
            service: '/services/context/service.ashx',
            app: 'PESTNISSAN',
            output: 'xml',
            action: 'GetVehicleConfigurations',
            contextPage: 'Landing',
            lang: ns.lang.get(),
			testUrl: "/buying/estimator/xml/GetVehicleConfigurations_leaf.xml",
			test: false
        },
        get: function(environment){
        	if (!environment) 
                environment = ns.environment.get();
            if (environment !== 'development') 
                environment = 'production';
            return this[environment];
        }
    };
    
    
 ////////////////////////////////////////////////////////////////////////////////
    // any urls for ajax calls
    ////////////////////////////////////////////////////////////////////////////////

    ns.videos = {
    	data: [
    	{
	        	id: 'lightsOn',
	        	href: '',
	        	text: 'Lights Go On',
	            sourceMp4: '/video/001_LIGHTS_GO_ON.mp4',
	            sourceWebm: '/video/001_LIGHTS_GO_ON.webm',
	            sourceOgv: '/video/001_LIGHTS_GO_ON.ogv',
	            poster: '/video/001_LIGHTS_GO_ON.jpg'
	      },
	      {
	        	id: 'pitcherToMound',
	        	href: '',
	        	text: 'Pitcher Goes to Mound',
	            sourceMp4: '/video/002_PITCHER_TO_MOUND.mp4',
	            sourceWebm: '/video/002_PITCHER_TO_MOUND.webm',
	            sourceOgv: '/video/002_PITCHER_TO_MOUND.ogv',
	            poster: '/video/002_PITCHER_TO_MOUND.jpg'
	      },
	      {
	        	id: 'pitcherLoop',
	        	href: '',
	        	text: 'Pitcher Loop Video',
	            sourceMp4: '/video/003_PITCHER_LOOP.mp4',
	            sourceWebm: '/video/003_PITCHER_LOOP.webm',
	            sourceOgv: '/video/003_PITCHER_LOOP.ogv',
	            poster: '/video/003_PITCHER_LOOP.jpg'
	      },
	      {
	        	id: 'gameOn',
	        	href: '',
	        	text: 'Game On Video',
	            sourceMp4: '/video/004_GAME_ON.mp4',
	            sourceWebm: '/video/004_GAME_ON.webm',
	            sourceOgv: '/video/004_GAME_ON.ogv',
	            poster: '/video/004_GAME_ON.jpg'
	      },
	      {
	        	id: 'pitch',
	        	href: '',
	        	text: 'Pitch Video',
	            sourceMp4: '/video/005_PITCH.mp4',
	            sourceWebm: '/video/005_PITCH.webm',
	            sourceOgv: '/video/005_PITCH.ogv',
	            poster: '/video/005_PITCH.png',
	            footnote: {
					start : 3.5,
					end : 4,
					target : "footnote",
					text : "SWING!"
				}
	       },
	       {
	        	id: 'hitCentre',
	        	href: '',
	        	text: 'Hit Centre Video',
	            sourceMp4: '/video/013_HIT_CENTRE_FIELD.mp4',
	            sourceWebm: '/video/013_HIT_CENTRE_FIELD.webm',
	            sourceOgv: '/video/013_HIT_CENTRE_FIELD.ogv',
	            poster: '/video/013_HIT_CENTRE_FIELD.jpg'
	       },
	       {
	        	id: 'hitRight',
	        	text: 'Hit Right Video',
	        	href: '',
	            sourceMp4: '/video/014_HIT_RIGHT_FIELD.mp4',
	            sourceWebm: '/video/014_HIT_RIGHT_FIELD.webm',
	            sourceOgv: '/video/014_HIT_RIGHT_FIELD.ogv',
	            poster: '/video/014_HIT_RIGHT_FIELD.jpg'
	       },
	       {
	        	id: 'hitLeft',
	        	text: 'Hit Left Video',
	        	href: '',
	            sourceMp4: '/video/012_HIT_LEFT_FIELD.mp4',
	            sourceWebm: '/video/012_HIT_LEFT_FIELD.webm',
	            sourceOgv: '/video/012_HIT_LEFT_FIELD.ogv',
	            poster: '/video/012_HIT_LEFT_FIELD.jpg'
	       },
	       
	       {
	        	id: 'grounderCentre',
	        	text: 'Grounder Centre Video',
	        	href: '',
	            sourceMp4: '/video/010_GROUNDER_CENTRE.mp4',
	            sourceWebm: '/video/010_GROUNDER_CENTRE.webm',
	            sourceOgv: '/video/010_GROUNDER_CENTRE.ogv',
	            poster: '/video/010_GROUNDER_CENTRE.jpg'
	       },
	       {
	        	id: 'grounderLeft',
	        	text: 'Grounder Left Video',
	        	href: '',
	            sourceMp4: '/video/009_GROUNDER_LEFT.mp4',
	            sourceWebm: '/video/009_GROUNDER_LEFT.webm',
	            sourceOgv: '/video/009_GROUNDER_LEFT.ogv',
	            poster: '/video/009_GROUNDER_LEFT.jpg'
	       },
	       {
	        	id: 'grounderRight',
	        	text: 'Grounder Left Video',
	        	href: '',
	            sourceMp4: '/video/011_GROUNDER_RIGHT.mp4',
	            sourceWebm: '/video/011_GROUNDER_RIGHT.webm',
	            sourceOgv: '/video/011_GROUNDER_RIGHT.ogv',
	            poster: '/video/011_GROUNDER_RIGHT.jpg'
	       },
	       {
	        	id: 'homerLeft',
	        	text: 'Homer Left Video',
	        	href: '',
	            sourceMp4: '/video/015_HOMER_LEFT_FIELD.mp4',
	            sourceWebm: '/video/015_HOMER_LEFT_FIELD.webm',
	            sourceOgv: '/video/015_HOMER_LEFT_FIELD.ogv',
	            poster: '/video/015_HOMER_LEFT_FIELD.jpg'
	       },
	       {
	        	id: 'homerCentre',
	        	text: 'Homer Centre Video',
	        	href: '',
	            sourceMp4: '/video/016_HOMER_CENTRE_FIELD.mp4',
	            sourceWebm: '/video/016_HOMER_CENTRE_FIELD.webm',
	            sourceOgv: '/video/016_HOMER_CENTRE_FIELD.ogv',
	            poster: '/video/016_HOMER_CENTRE_FIELD.jpg'
	       },
	       {
	        	id: 'homerRight',
	        	text: 'Homer Right Video',
	        	href: '',
	            sourceMp4: '/video/017_HOMER_RIGHT_FIELD.mp4',
	            sourceWebm: '/video/017_HOMER_RIGHT_FIELD.webm',
	            sourceOgv: '/video/017_HOMER_RIGHT_FIELD.ogv',
	            poster: '/video/017_HOMER_RIGHT_FIELD.jpg'
	       },
	       {
	        	id: 'foulRight',
	        	text: 'Foul Right Video',
	        	href: '',
	            sourceMp4: '/video/008_FOUL_BALL_RIGHT.mp4',
	            sourceWebm: '/video/008_FOUL_BALL_RIGHT.webm',
	            sourceOgv: '/video/008_FOUL_BALL_RIGHT.ogv',
	            poster: '/video/008_FOUL_BALL_RIGHT.jpg'
	       },
	       {
	        	id: 'foulLeft',
	        	text: 'Foul Left Video',
	        	href: '',
	            sourceMp4: '/video/007_FOUL_BALL_LEFT.mp4',
	            sourceWebm: '/video/007_FOUL_BALL_LEFT.webm',
	            sourceOgv: '/video/007_FOUL_BALL_LEFT.ogv',
	            poster: '/video/007_FOUL_BALL_LEFT.jpg'
	       },
	       {
	        	id: 'strike',
	        	text: 'Strike Video',
	        	href: '',
	            sourceMp4: '/video/006_STRIKE.mp4',
	            sourceWebm: '/video/006_STRIKE.webm',
	            sourceOgv: '/video/006_STRIKE.ogv',
	            poster: '/video/006_STRIKE.jpg'
	       }
        ],
        options: {
        	features: []
        },
        get: function(lang){
            return this;
        }
    };
    
    ////////////////////////////////////////////////////////////////////////////////
    // all static text that gets injected into template variables '{{ teplateVar }}'
    ////////////////////////////////////////////////////////////////////////////////
      
    ns.staticText = {
        en: {
        	
            lang: 'en',
            languageShort: 'en',
            language: 'English',
            locale: 'en-CA',
            rightDollarSign: '',
            leftDollarSign: '$&nbsp;',
            
            location: 'My location: ',
            print: 'Print',
            email: 'Email',
            share: 'Share',
            months: 'Months',
			monthsPerKilometers: 'mo/km',
            currentYear: '2013',
            
			thanks : 'THANKS!',
			back: 'back',
			select: 'Select',
            on: 'on',
            off: 'off',
            arrowDown: '▼',
            arrowUp: '▲',

            pstText: 'PST',
            qstText: 'QST',
            gstText: 'GST',
            hstText: 'HST',

			km: 'km',
            or: 'OR',
            
            registrationInstructions: 'We need some basic information to sign you up.',
            registrationFormTitle: 'Contract Negotiations',
            firstNameText: 'First Name',
            lastNameText: 'Last Name',
            userNameText: 'User Name',
            emailAddressText: 'Email Address',
            confirmEmailText: 'Confirm Email',
            submit: 'Submit',
            passwordText: 'Password',
            socialLoginText: 'Log in with your preferred social account to get instant access:',
            
            registrationOptionsTitle: 'how to play',
            registrationOptionsDescription: 'Welcome to z300 slugger game. Some description about stuff. Lorem ipsum...',
            register: 'Register',
            
            loginTxt: 'Log In',
            loginFormTitle: 'Log In',
            loginInstructions: 'Log in instructions...',
            
            loggedIn: 'Logged In',
            loggedInFormTitle: 'Logged In:',
            loggedInInstructions: 'Logged in instructions...',
            
            forgotPswdTitle: 'Forgot Password Title',
            forgotPswdInstructions: 'Enter your email address and we will email your password',
            forgotPassword: 'Forgot password?',
            
            welcome: 'Welcome',
            play: 'play',
            
            // Form text
            search: 'SEARCH',
            phoneContact: 'Phone:',
            
            address1: 'Address:',
            address2: 'Alternate adress',
            userAddress1: 'User street address 1',
            userAddress2: 'User street address 2',
            socialTitle: 'Title:',
            mr: 'Mr.',
            ms: 'Ms.',
            mrs: 'Mrs.',
            miss: 'Miss',
            dr: 'Dr.',
            female: 'Female',
            male: 'Male',
            
            userFirstName: 'User first name',
            userLastName: 'User last name',
            userAddress: 'User street address',
            apt: 'Apt.:',
            userApartment: 'User apartment',
            cityText: 'City:',
            userCity: 'User city',
            provinceText: 'Province:',
            provinceOptions: '- Province Options -',
            postalCodeText: 'Postal Code:',
            userPostalCode: 'XXX XXX',
            emailContact: 'Email:',
            userEmail: 'example@example.com',
            preferredMethodOfContact: 'Preferred method of contact',
            phone: 'Phone',
            cellPhone: 'Cell phone',
            save: 'SAVE',
            close: 'close',
            kms: 'kms',
            
            alberta: 'Alberta',
            britishColumbia: 'British Columbia',
            manitoba: 'Manitoba',
            newBrunswick: 'New Brunswick',
            newfoundlandLabrador: 'Newfoundland and Labrador',
            novaScotia: 'Nova Scotia',
            ontario: 'Ontario',
            princeEdwardIsland: 'Prince Edward Island',
            quebec: 'Quebec',
            saskatchewan: 'Saskatchewan',
            northwestTerritories: 'Northwest Territories',
            nunavut: 'Nunavut',
            yukon: 'Yukon',
            
            connected: 'Connected',
            disconnected: 'Disconnected',
            notConnected: 'Not Connected',
            room: 'Room: ',
            game: 'Game: ',
            status: 'Status: ',
            none: 'None',
            gameNotAvailable: 'Game Not Available (No desktop client for this room id)',
            start: 'Start',
            
            // SCREENS
            gameConnectTitle: "connect your phone",
            gameConnectInstructions: "Win something by playing this game. Your bat is your phone! Scan the QR code or visit the url on your mobile device.",
            bitlyUrlText: "Short Url (bitly): ",
            mobileUrlText: "Full Url: ",
            bitlyResponseErrorText: "Bitly url could not be generated. Please use the full url listed below.",
            qrCodeText: "QR Code: ",
            gameCodeText: "Your Game Code: ",
            
            landingIntroScreenTitle: "Landing Page Title",
            landingIntroInstructions: "Landing Page Instuctions",
            
            // Mobile specific
            enterGameCodeTitle: "enter your<br/>game code",
            enterYourGameCode: "enter your game code",
            enterGameCodeInstructions: "Enter Your Game Code Instructions...",
            
            startScreenTitle: "get ready to hit",
            startInstructions: "",
           // practiceSwingsInstructions: "You’ll get three practice pitches to get warmed up.",
           // youGet: "You'll get ",
            //practicePitchesToGetWarmedUp: "practice pitches to get warmed up.",
            //startInstructions: "You’ll get three pitches for three chances to determine how much you’ll pay for the new Z-3000. When you’re ready press start.",
            
            gameConnectedTitle: "CONNECTED",
            gameConnectedInstructions: "Now use your phone to choose a bat and get started.",
            
            gameGetReadyTitle: "",
            gameGetReadyInstructions: "Get Ready!",
            
            gameBatModeTitle: "Bat Mode",
            gameBatModeCopy: "",
            
            reconnect: "reconnect",
            
            pitchesLeftText: "PITCHES LEFT",
            rankingText: "RANKING",
            maxDistanceText: "LONGEST HIT",
            
            strike: "Strike",
            hit: "Hit",
            feet: "FT",
            
            gameCompleteTitle: "final stats",
            gameCompleteShareInstructions: "Share for 3 more swings",
            gameCompleteInstructions: "You have no more swings.",
            gameCompleteMobileInstructions: "Check your desktop for next steps!",
            leaderboardLinkText: "View Leaderboard",
            
            leaderboardTitle: "LEADERBOARD",
            rankTxt: "RANK",
            playerTxt: "PLAYER",
            distanceTxt: "DISTANCE",
            discountTxt: "DISCOUNT",
            
            getReadyAndHit: "get ready and hit",
            pitch: "PITCH",
            onYourPhone: "on your phone",
            
            landingPageTitle: "Contest Headline",
            contestDescription: "<p>Praesent condimentum odio nisi, at convallis ipsum rutrum molestie. Fusce tempor ornare urna, et porta risus pellentesque at. Maecenas vel lorem lectus. Donec malesuada leo a magna tincidunt, a vehicula nibh porta.</p><p>Morbi auctor eros sapien, ut varius nisi rutrum nec. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nunc vitae turpis sapien. Donec in neque faucibus, mollis lorem ac, aliquet urna. Donec mattis pharetra venenatis. Cras commodo id metus ac lacinia. </p>",
            prizeDescription: "<p>Cras commodo id metus ac lacinia. Curabitur in vehicula odio. Proin porttitor rhoncus ultrices. Pellentesque molestie erat augue, et porttitor lacus egestas ac. Phasellus a massa mollis, blandit purus quis, tempus turpis</p>",
            prizePicUrl: '/img/prize-pic-en.jpg',
            gamePageBtnTxt: 'Take your swing to the big leagues',
            findPlayer: "Find a player",
            
            playForFun: "Play for fun",
            practice: "practice",
            practiceUsernameTitle: "Practice Game",
            practiceUsernameInstructions: "Please enter a user name",
            next: "next",
            
            practiceSwingsTitle: "warm up",
            practiceSwingsInstructions: "Take 3 practice swings to warm up!",
            youHave: "You have",
            practiceSwingsLeft: "practice swings to get warmed up.",
            percent: "%",
            
            proGameIntroTitle: "play ball",
            readyToPlay: "Ready to play?",
            swingsLeft: "swings remaining.",
            
            leaderBoardNumItemsPerPg: 10,
            ellipsis: "...",
            dollarSignLeft: "$",
            dollarSignRight: "",

            leaders: "leaders",
            stepOneTitle: "step 1",
            stepTwoTitle: "step 2",
            stepThreeTitle: "step 3",
            stepOneHowToPlay: "Connect your smartphone to your computer.",
            stepTwoHowToPlay: "Swing your smartphone at the pitch.",
            stepThreeHowToPlay: "The better you hit the ball the less you’ll pay for the Z-3000.",
            enter: "enter",
            stepOneConnect: "Enter the URL in your smartphone browser",
            stepTwoConnect: "Enter game code",
            
            pitchInstructions: "",
            
            learnMore: "learn more",
            learnMoreAboutZ000: "More about the Z-3000?",
            yourLongestHit: "YOUR LONGEST HIT",
            yourRanking: "YOUR RANKING",
            yourPrice: "YOUR Z-0000 PRICE",
            
            go: 'go',
            chooseYourBat: 'choose your bat',
            
            deviceNotSupported: "Your mobile device is not supported.",
            learnMoreUrl: "http://slugger.com/",
            foulBall: "foul ball",
            
            bats: [
            	{
					id: 1,
					accuracy: 1,
					power: 1,
					img: '/mobile/img/bat-1-red.png',
					name: 'red bat',
					elClass: 'pane1'
				},
				{
					id: 2,
					accuracy: 1,
					power: 1,
					img: '/mobile/img/bat-2-green.png',
					name: 'green bat',
					elClass: 'pane2'
				},
				{
					id: 3,
					accuracy: 1,
					power: 1,
					img: '/mobile/img/bat-3-silver.png',
					name: 'silver bat',
					elClass: 'pane3'
				},
				{
					id: 4,
					accuracy: 1,
					power: 1,
					img: '/mobile/img/bat-4-gold.png',
					name: 'gold bat',
					elClass: 'pane4'
				}
            ],
            
            errors: {
                validation: {
                    postalCodeMsg: 'Please provide a valid postal code, eg.(A1A1A1).',
                    requiredMsg: ' is required.',
                    nameMsg: 'Please provide a valid name.',
                    addressMsg: 'Please provide a valid address.',
                    emailMsg: 'Please provide a valid email address.',
                    confirmEmailMsg: "Your emails don't match.",
                    phoneMsg: 'Please provide a valid phone number eg. (555) 555-5555',
                    dealerMsg: 'Please select a dealer.',
                    password: 'Password must be at least 6 characters long.',
                    emailUniqueMsg: 'Your email is already in use.',
                    userNameUniqueMsg: 'Your user name has already been taken.',
                    socialIdUniqueMsg: 'Some one has already registered with this social account.',
                    emailAddressIncorrect: 'Incorrect email.',
                    passwordIncorrect: 'Incorrect password.',
                    gameCode: 'Please provide a valid game code eg. abcde',
                    gameCodeIncorrect: 'We could not find a corresponding game code.'
                },
                loginError: {
                    errorTitle: 'Log In ERROR',
                    errorDescription: 'There was an error logging you in. Please make sure you are not logged in on another browser window.',
                    errorInstructions: '',
                    errorContactEmailAddress: 'support@taxi.ca',
                    errorContactEmailText: 'Contact: ',
                    btnTxt: 'CLOSE'
                },
                 connectionError: {
                    errorTitle: 'Connection ERROR',
                    errorDescription: 'The slugger game is currently unavailble. Please check back soon.',
                    errorInstructions: '',
                    errorContactEmailAddress: 'support@taxi.ca',
                    errorContactEmailText: 'Contact: ',
                    btnTxt: 'RETRY'
                },
                databaseConnectionError: {
                    errorTitle: 'Database Connection ERROR',
                    errorDescription: 'The slugger game is currently unavailble. Please check back soon.',
                    errorInstructions: '',
                    errorContactEmailAddress: 'support@taxi.ca',
                    errorContactEmailText: 'Contact: ',
                    btnTxt: 'CLOSE'
                },
                defaultError: {
                    errorTitle: 'DEFAULT ERROR',
                    errorDescription: 'The payment estimator is currently unavailble. Please check back soon.',
                    errorInstructions: '',
                    errorContactEmailAddress: 'support@taxi.ca',
                    errorContactEmailText: 'Contact: ',
                    btnTxt: 'CLOSE'
                },
                mobileConnectionError: {
                    errorTitle: 'ERROR',
                    errorDescription: 'Your device is not connected!',
                    errorInstructions: '',
                    errorContactEmailAddress: 'support@taxi.ca',
                    errorContactEmailText: 'Contact: ',
                    btnTxt: 'CLOSE'
                },
                swingRetryError: {
                    errorTitle: 'Mobile Connection Error',
                    errorDescription: 'There was a problem with your mobile device. We will let you rety your last swing.<br/>Please click retry on your mobile device.',
                    errorInstructions: '',
                    errorContactEmailAddress: 'support@taxi.ca',
                    errorContactEmailText: 'Contact: ',
                    btnTxt: 'RETRY'
                }
            },
            
            provinceOpts: {
                data: [{
                    value: "AB",
                    text: "Alberta",
                    id: "AB"
                }, {
                    value: "BC",
                    text: "British Columbia",
                    id: "BC"
                }, {
                    value: "MB",
                    text: "Manitoba",
                    id: "MB"
                }, {
                    value: "NB",
                    text: "New Brunswick",
                    id: "NB"
                }, {
                    value: "NL",
                    text: "Newfoundland and Labrador",
                    id: "NL"
                }, {
                    value: "NS",
                    text: "Nova Scotia",
                    id: "NS"
                }, {
                    value: "ON",
                    text: "Ontario",
                    id: "ON"
                }, {
                    value: "PE",
                    text: "Prince Edward Island",
                    id: "PE"
                }, {
                    value: "QC",
                    text: "Quebec",
                    id: "QC"
                }, {
                    value: "SK",
                    text: "Saskatchewan",
                    id: "SK"
                }, {
                    value: "NT",
                    text: "Northwest Territories",
                    id: "NT"
                }, {
                    value: "NU",
                    text: "Nunavut",
                    id: "NU"
                }, {
                    value: "YT",
                    text: "Yukon",
                    id: "YT"
                }],
                selected: "AB",
                name: 'province'
            },
            
            social: {
                facebook: {
                    link: 'lvslugger.fatboxes.com'+window.location.pathname,
                    name: 'Slugger | TAXI Canada',
                    description: 'Play Slugger for homerun supremacy!',
                    picture: 'http://localhost:8000/img/LouisvilleSlugger.png'
                },
                twitter: {
                    url: 'http://nissan.ca/buying/estimator/en/',
                    description: 'Check out our new payment estimator',
                    hashtag: '#nissan'
                }
            },
			disclaimer: 'lorem ipsum'
        },
        fr: {
            lang: 'fr',
            language: 'Francais',
            locale: 'fr-CA',
            rightDollarSign: '&nbsp;$',
            leftDollarSign: '',
            location: 'Ma région : ',
            print: 'Print',
            email: 'Courriel',
            share: 'Share',
            months: 'Mois',
			monthsPerKilometers: 'mo/km',
            thisYear: '2012',
				
			thanks : 'THANKS!',
			back: 'retour',
			
			on: 'marche',
            off: 'arrêt',
            visible: '▼',
            hidden: '▲',
            
            notIncludedText: 'Non compris',
            notAvailableText: 'n.d./s.o.',

            pstText: 'TVP',
            qstText: 'TVQ',
            gstText: 'TPS',
            hstText: 'TVH',

			km			: 'km',
            annualKmText: 'KM annuel',
            apply: 'DEMANDE',

            send: 'TRANSMETTRE',
            submit: 'SOUMETTRE',
			
			// Form stuff
            yourInformation: 'VOS COORDONNÉES',
            or: 'OU',
            pleaseEnterPostalCode: 'Veuillez entrer un code postal canadien valide (A1A 1A1).',
            search: 'RECHERCHE',
            retailersPostalCode: '',
            retailerName: 'Retailer Name',
            retailerAddress1: 'Street address 1',
            retailerAddress2: 'Street address 2',
            phoneContact: 'Téléphone :',
            emailAddress: 'Courriel :',
            retailerPhoneNumber: '(000) 000-0000',
            retailerEmailAddress: 'example@example.com',
            address1: 'Adresse :',
            address2: 'Alternate adress',
            userAddress1: 'User street address 1',
            userAddress2: 'User street address 2',
            socialTitle: 'Titre :',
            mr: 'M.',
            ms: 'Mme',
            mrs: 'Mme',
            miss: 'Mademoiselle',
            dr: 'Dr',
            female: 'Femelle',
            male: 'Mâle',
            firstName: 'Prénom :',
            lastName: 'Nom :',
            userFirstName: 'User first name',
            userLastName: 'User last name',
            userAddress: 'User street address',
            apt: 'App. :',
            userApartment: 'User apartment',
            cityText: 'Ville :',
            userCity: 'User city',
            provinceText: 'Province :',
            provinceOptions: '- Sélectionnez votre province -',
            postalCodeText: 'Code postal :',
            userPostalCode: 'XXX XXX',
            emailContact: 'Courriel :',
            userEmail: 'example@example.com',
            preferredMethodOfContact: 'Mode de communication privilégié',
            phone: 'Téléphone (rés.)',
            cellPhone: 'Cellulaire',
            
            subscribe: 'J’aimerais recevoir des renseignements sur les véhicules et les offres de Nissan Canada.',
			select: 'Choisissez',
            save: 'SAUVEGARDER',
            close: 'fermer',
            distanceText: 'Distance: ',
            kms: 'kms',
            
            alberta: 'Alberta',
            britishColumbia: 'Colombie-Britannique',
            manitoba: 'Manitoba',
            newBrunswick: 'Nouveau-Brunswick',
            newfoundlandLabrador: 'Terre-Neuve-et-Labrador',
            novaScotia: 'Nouvelle-Écosse',
            ontario: 'Ontario',
            princeEdwardIsland: 'Île-du-Prince-Édouard',
            quebec: 'Québec',
            saskatchewan: 'Saskatchewan',
            northwestTerritories: 'Territoires du Nord-Ouest',
            nunavut: 'Nunavut',
            yukon: 'Yukon',
            
            errors: {
                validation: {
                    postalCodeMsg: 'Veuillez entrer un code postal canadien valide (A1A 1A1).',
                    requiredMsg: ' champs obligatoires',
                    nameMsg: 'Veuillez entrer votre prénom.',
                    addressMsg: 'Veuillez entrer votre adresse.',
                    emailMsg: 'Veuillez entrer votre adresse courriel. (anything@aaa.com)',
                    phoneMsg: 'Veuillez entrer votre numéro de téléphone avec l’indicatif régional. (555) 555-5555',
                    dealerMsg: 'Veuillez sélectionner un concessionnaire'
                },
                defaultError: {
                    errorTitle: 'DEFAULT ERROR:',
                    errorDescription: 'L’estimateur de paiements n’est pas disponible pour le moment.<br>Veuillez réessayer plus tard.',
                    errorInstructions: '',
                    errorContactEmailAddress: 'support@capitalc.ca',
                    errorContactEmailText: 'Contact: ',
                    close: 'FERMER'
                }
            },
            provinceOpts: {
                data: [{
                    value: "AB",
                    text: "Alberta",
                    id: "AB"
                }, {
                    value: "BC",
                    text: "Colombie-Britannique",
                    id: "BC"
                }, {
                    value: "MB",
                    text: "Manitoba",
                    id: "MB"
                }, {
                    value: "NB",
                    text: "Nouveau-Brunswick",
                    id: "NB"
                }, {
                    value: "NL",
                    text: "Terre-Neuve-et-Labrador",
                    id: "NL"
                }, {
                    value: "NS",
                    text: "Nouvelle-Écosse",
                    id: "NS"
                }, {
                    value: "ON",
                    text: "Ontario",
                    id: "ON"
                }, {
                    value: "PE",
                    text: "Île-du-Prince-Édouard",
                    id: "PE"
                }, {
                    value: "QC",
                    text: "Québec",
                    id: "QC"
                }, {
                    value: "SK",
                    text: "Saskatchewan",
                    id: "SK"
                }, {
                    value: "NT",
                    text: "Territoires du Nord-Ouest",
                    id: "NT"
                }, {
                    value: "NU",
                    text: "Nunavut",
                    id: "NU"
                }, {
                    value: "YT",
                    text: "Yukon",
                    id: "YT"
                }],
                selected: "AB",
                name: 'province'
            },
            social: {
                facebook: {
                    url: window.location.href,
                    title: 'ESTIMATEUR DE PAIEMENTS | Nissan Canada',
                    description: 'Je viens de configurer mon propre modèle {{model}} de Nissan. Cliquez ici pour configurer le vôtre.',
                    image: 'http://nissan.ca/images/home/fr/NissanCanada.gif'
                },
                twitter: {
                    url: 'http://nissan.ca/buying/estimator/en/',
                    description: 'Check out our new payment estimator',
                    hashtag: '#nissan'
                }
				
            },
			disclaimer: 'lorem ipsum'
        },
        get: function(lang){
            if (!lang) 
                lang = ns.lang.get();
            if (lang !== 'fr') 
                lang = 'en';
            return this[lang];
        }
    };

}(app.config, jQuery, _));
