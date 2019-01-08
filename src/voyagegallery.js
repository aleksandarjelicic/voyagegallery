/*!
 * voyagegallery - version
 * jQuery gallery
 * https://github.com/aleksandarjelicic/voyagegallery
 * @author Aleksandar Jeličić <jelicicaleksandar@gmail.com>
 * @license MIT
 */

(function($) {
    $.fn.voyageGallery = function(options) {

        var settings = $.extend({
            background : 'red',
            caption : true,
            captionPosition : 'top',
            thumbnails: true,
            imgNoInUrl: true,
            imageLoop: true,
            autoPlayIcon: true,
            autoPlay: true,
            autoPlayTransitionTime: 2000,
            swipe: true,
            onBeforeSliderStart: function(){},
            onAfterSliderLoad: function(){},
            onBeforeSliderOpens: function(){},
            onAfterSliderOpens: function(){},
            onBeforeSlideChange: function(){},
            onAfterSlideChange: function(){},
            onBeforeNextSlide: function(){},
            onBeforePrevSlide: function(){}
        }, options)

        if(settings.swipe == true) {
            var script = document.createElement('script');
            script.src = 'src/pure-swipe.js';
            script.type = 'text/javascript';
            document.getElementsByTagName('head')[0].appendChild(script);
        }

        // lets check if url points to an image
        var urlGalNo = null;
        var url = window.location.href;
        var regex = /gal\=(\d*)/gm;
        var n = regex.exec(url);

        if (n && n[1]) {
            // yes it does
            urlGalNo = n[1];
        }

        // lets check if url points to an image
        var url2 = window.location.href;
        var regex2 = /img\=(\d*)/gm;
        var n2 = regex2.exec(url2);

        if (n2 && n2[1]) {
            // yes it does
            urlImageNo = n2[1];
        }

        var globalThis = this;

        return this.each(function(index, item){
            console.log('this slider', this);
            console.log('$(this) slider', $(this));
            console.log('this slider index', index);
            console.log('$(this) item', item);

            this.goToSlide = function(goToGalNo, goToSlideNo) {
                // if goToSlide parameters are numbers and there is no number in url
                if(Number.isInteger(goToGalNo) && Number.isInteger(goToSlideNo) && urlGalNo == null) {
                    thisThis = globalThis.eq(goToGalNo).find('a').eq(goToSlideNo);
                    openGallery(thisThis);   
                }
            }

            var galleryIndex = index;
            
            settings.onBeforeSliderStart();
            
            var dataRel;
            var imgSrc;
            var imgCaption;
            var imageList = [ ];
            var imagePosition = 0;
            var thumbPosition = 0;
            
            var thumbWidth = 0;
            var thumbHeight = 0;
            var captionHeight = 0;
            
            var circleArray = [[]];
            var thumbCircle = 0;
            var mainIndex = 0;
            var maxThumbCircle = 0;
            var maxThumbCircleReminder = 0;
            var thumbTotal;
            
            var fullThumbnailsWidth;
            var visibleThumbs;
            var visibleThumbsRemainder;

            var autoPlayTimeOut;
            var autoPlayOn = false;
            
            if(urlGalNo == index) {
                thisThis = globalThis.eq(urlGalNo).find('a').eq(urlImageNo);
                openGallery(thisThis);
            }

            $(this).find('.voyage__thumbnails a').click(function(e) {
                e.preventDefault();

                openGallery($(this));

            });
            
            function openGallery(thisImg) {

                openGalImg = thisImg;

                openGalImg.focus();

                settings.onBeforeSliderOpens();

                console.log('Gallery image click start');

                thisImg.parent().css('background', settings.background);

                $('body').addClass('activeGallery').append('<div class="voyage__background"></div>');

                dataRel = thisImg.attr('data-rel');

                imgSrc = thisImg.attr('href');

                console.log('this click', thisImg);

                thisImg.parent().parent().append('<div class="voyage__imageWrap"><div class="voyage__image"><figcaption></figcaption><figure><img src="'+ imgSrc +'"></figure><div class="voyage__topBar"><div class="voyage__close"></div></div><div class="voyage__arrow voyage__arrow--left"></div><div class="voyage__arrow voyage__arrow--right"></div></div></div></div>');

                if (settings.thumbnails == true) {
                    thisImg.parent().parent().find('.voyage__imageWrap').append('<div class="voyage__fullThumbnailsWrap"><div class="voyage__fullThumbnails"></div><div class="voyage__fullThumbnailsArrow voyage__fullThumbnailsArrow--left"></div><div class="voyage__fullThumbnailsArrow voyage__fullThumbnailsArrow--right"></div>');
                }

                $(thisImg.parent().find('a[data-rel="'+ dataRel +'"]')).each(function(index, item) {

                    if (settings.thumbnails == true) {
                        var imageThumbnails = $(this);
                        console.log('imageThumbnails', imageThumbnails);
                        $('.voyage__fullThumbnails').append(imageThumbnails.clone()); 

                    }
                    
                    var imageHref = $(item).attr('href');
                    var imageCaption = $(item).find('img').attr('alt');
                    var imageObj = {imageHref, imageCaption};
                    
                    imageList.push(imageObj);
                    
                });

                console.log('imageList', imageList);

                captionSettings();

                console.log('imagePosition', imagePosition);
     
                imagePosition = searchObj(imgSrc, imageList);
                console.log('Search object position in array', imagePosition);

                if (settings.thumbnails == true) {
                    $(window).bind('resizeEnd', function() {
                        // Recalculating new thumb cicles on resize
                        thumbLogic();
    
                        // Repositioning active thumb and thumb circle based on new calculations on resize
                        mainIndex = nestedIndex(circleArray, imagePosition);
                        thumbCircle = mainIndex;
                    
                        changeThumbCircle();

                        // imageHeight()
    
                    });
    
                    // Initial thumb logic and calculation of cicles and active cicle
                    thumbLogic();
    
                    mainIndex = nestedIndex(circleArray, thisImg.index());
    
                    thumbCircle = mainIndex;
    
                    console.log('thumbCircle mainIndex', thumbCircle);
    
                    console.log('mainIndex', mainIndex);                    
                    
                    changeThumbCircle();
    
                    thumbActive();

                    // imageHeight();

                }

                // imageHeight()
                
                imgNoInUrl();

                console.log('Gallery image click end');

                if (settings.autoPlayIcon == true) {
                    thisImg.parent().parent().find('.voyage__topBar').prepend('<div class="voyage__autoPlay"></div>');
                }
                
                if (settings.autoPlay == true) {
                    imagePosition--;
                    autoPlayOn = true;
                    $('.voyage__autoPlay').addClass('voyage__autoPlay--pause');
                    rightArrow();
                }

                settings.onAfterSliderOpens();

            }
            
            $(this).on('click', '.voyage__fullThumbnails a', function(e) {

                console.log('$(this)', $(this));
                console.log('this', this);

                console.log('voyage__fullThumbnails image click start');

                e.preventDefault();        
                
                imgSrc = $(this).attr('href');
                console.log('imgSrc on thumb click', imgSrc);

                imagePosition = searchObj(imgSrc, imageList);
                changeImage();
                console.log('imagePosition on thumb click', imagePosition);

                mainIndex = nestedIndex(circleArray, $(this).index());
                thumbCircle = mainIndex;
                console.log('thumbCircle mainIndex on thumb click', thumbCircle);

                changeThumbCircle();

                thumbActive();

                imgNoInUrl();

                // imageHeight()

                console.log('voyage__fullThumbnails image click end');

            });

            $(this).on('click', '.voyage__arrow--left', function() {
                stopAutoPlay();
                leftArrow();
            });

            function leftArrow() {
                settings.onBeforePrevSlide();

                if (imagePosition > 0) {
                    imagePosition -= 1;
                } else if (imagePosition == 0) {
                    if (settings.imageLoop == true) {
                        imagePosition = imageList.length - 1;
                    }
                }

                changeImage();

                mainIndex = nestedIndex(circleArray, imagePosition);
                thumbCircle = mainIndex;
                
                changeThumbCircle();

                thumbActive();

                // imageHeight()

                imgNoInUrl();
            }

            $(this).on('click', '.voyage__arrow--right', function() {
                stopAutoPlay();
                rightArrow();
            });

            function rightArrow() {
                settings.onBeforeNextSlide();
                
                if (imagePosition < imageList.length - 1) {
                    imagePosition += 1;
                } else if (imagePosition == imageList.length - 1) {
                    if (settings.imageLoop == true) {
                        imagePosition = 0;
                    }
                }
                
                changeImage();

                mainIndex = nestedIndex(circleArray, imagePosition);
                thumbCircle = mainIndex;
                
                changeThumbCircle();

                thumbActive();

                // imageHeight()

                imgNoInUrl();

                if (autoPlayOn == true) {
                    autoPlayTimeOut = setTimeout(rightArrow, settings.autoPlayTransitionTime);
                }
            }
            
            if(settings.swipe == true) {
                document.addEventListener('swiped-left', function(e) {
                    console.log('Swiped left');
                    rightArrow();
                });
                
                document.addEventListener('swiped-right', function(e) {
                    console.log('Swiped right');
                    leftArrow();
                });
            }

            $(this).on('click', '.voyage__autoPlay', function(){
                if (autoPlayOn == false) {
                    $(this).addClass('voyage__autoPlay--pause');
                    autoPlayOn = true;
                    rightArrow();
                } else {
                    stopAutoPlay();
                }
            });

            $(this).on('click', '.voyage__fullThumbnailsArrow--left', function() {
                if (thumbCircle > 0) {
                    thumbCircle -= 1;
                    console.log('circleLeft', thumbCircle);
                    thumbPosition = (visibleThumbs * thumbWidth) * thumbCircle;
                    changeThumbCircle()
                }
            });

            $(this).on('click', '.voyage__fullThumbnailsArrow--right', function() {
                if (thumbCircle < maxThumbCircle) {
                    thumbCircle += 1;
                    console.log('circleRight', thumbCircle);
                    
                    changeThumbCircle()
                }
            });

            function captionSettings() {
                if (settings.caption == true) {
                    console.log('settings.caption', 'true');
                    console.log('imageList[imagePosition].imageCaption', imageList[imagePosition].imageCaption);
                    if(imageList[imagePosition].imageCaption) {
                        imgCaption = imageList[imagePosition].imageCaption;
                    } else {
                        imgCaption = ' ';
                    }
                    $(".voyage__image figcaption").html(imgCaption);
                    if (settings.captionPosition == 'bottom') {
                        $('.voyage__image figcaption').css('order', 2);
                    }
                } else if (settings.caption == false && settings.captionPosition == 'bottom') {
                    console.log('You just turned caption: hide and captionPosition: bottom. Why?')
                } else {
    
                }
            }

            function changeImage() {
                settings.onBeforeSlideChange();
                console.log('imagePosition', imagePosition);
                console.log('imageList.length', imageList.length);
                imgSrc = imageList[imagePosition].imageHref;
                $('.voyage__image img').attr('src', imgSrc);
                // imageHeight()
                return settings.onAfterSlideChange();
            }

            function thumbLogic() {
                
                fullThumbnailsWidth = $('body').width();
                console.log('sirina', fullThumbnailsWidth);

                thumbWidth = $('.voyage__fullThumbnails a').outerWidth();
                console.log('thumbWidth', thumbWidth);

                visibleThumbsRemainder = fullThumbnailsWidth % thumbWidth;

                console.log('visibleThumbsRemainder', visibleThumbsRemainder);
                visibleThumbs = (fullThumbnailsWidth - visibleThumbsRemainder) / thumbWidth;


                thumbTotal = $('.voyage__fullThumbnails a img').length;
                console.log('thumbTotal', thumbTotal);

                maxThumbCircleReminder = thumbTotal % visibleThumbs;

                if (maxThumbCircleReminder == 0) {
                    maxThumbCircle = (thumbTotal - maxThumbCircleReminder) / visibleThumbs;
                    maxThumbCircle = maxThumbCircle - 1;
                } else {
                    maxThumbCircle = (thumbTotal - maxThumbCircleReminder) / visibleThumbs;
                }

                console.log('maxThumbCircleReminder', maxThumbCircleReminder);
                console.log('visibleThumbs', visibleThumbs);
                console.log('maxThumbCircle', maxThumbCircle);

                // Creating multidimensinal array based on number of vissible thumbs
                // eg 8 images, 4 vissible thumbs, creates array [[0, 1, 2, 3], [4, 5, 6, 7]]
                var currentNo = 0;

                for (i=0; i<maxThumbCircle+1; i++) {
                    circleArray[i] = [ ];
                    for (d=0; d<visibleThumbs; d++) {
                        
                        circleArray[i][d] = currentNo;
                        currentNo++;
                    }
                    currentNo = (i+1) *  visibleThumbs;
                }
                console.log('circleArray', circleArray);

            }

            function changeThumbCircle() {

                if (maxThumbCircleReminder == 0) {
                    if (thumbCircle == maxThumbCircle) {
                        var lastCircleReminder = (visibleThumbs - maxThumbCircleReminder) * thumbWidth + visibleThumbsRemainder;
                        thumbPosition = (visibleThumbs * thumbWidth) * thumbCircle;
                        thumbPosition = thumbPosition - visibleThumbsRemainder;
                        console.log('thumbPosition', thumbPosition);
                    } else {
                        thumbPosition = (visibleThumbs * thumbWidth) * thumbCircle;
                    }
                } else {
                    if (thumbCircle == maxThumbCircle) {
                        var lastCircleReminder = (visibleThumbs - maxThumbCircleReminder) * thumbWidth + visibleThumbsRemainder;
                        thumbPosition = (visibleThumbs * thumbWidth) * thumbCircle;
                        thumbPosition = thumbPosition - lastCircleReminder;
                        console.log('thumbPosition', thumbPosition);
                    } else {
                        thumbPosition = (visibleThumbs * thumbWidth) * thumbCircle;
                    }
                }

                if (maxThumbCircle == 0) {
                    $('.voyage__fullThumbnails').css({"transform": "translate3d(" +- 0 + "px, 0px, 0px)"});
                } else {
                    $('.voyage__fullThumbnails').css({"transform": "translate3d(" +- thumbPosition + "px, 0px, 0px)"});
                }
            }

            function nestedIndex(circleArray, el) {
                return circleArray.findIndex(function(subarray) {
                    var index = subarray.indexOf(el);
                    return index > -1 ? true : false;
                });
            }

            function searchObj(nameKey, myArray){
                for (var i=0; i < myArray.length; i++) {
                    if (myArray[i].imageHref === nameKey) {
                        return myArray.indexOf(myArray[i]);
                    }
                }
            }

            function thumbActive() {
                $('.voyage__fullThumbnails a').removeClass('active');
                $('.voyage__fullThumbnails a').eq(imagePosition).addClass('active');

                captionSettings();
            }

            function imgNoInUrl() {
                if (settings.imgNoInUrl == true) {
                    window.history.replaceState(null, null, '?gal=' + galleryIndex + '?img=' + parseInt(imagePosition));
                    console.log('window.location.hash', window.location);
                }
            }

            function stopAutoPlay() {
                $('.voyage__autoPlay').removeClass('voyage__autoPlay--pause');
                autoPlayOn = false;
                clearTimeout(autoPlayTimeOut);
            }

            $(this).on('click', '.voyage__close', function() {
                closeGallery();
            });

            function closeGallery() {
                stopAutoPlay();
                $('body').removeClass('activeGallery');
                $('.voyage__background').remove();
                $('.voyage__imageWrap').remove();
                imageList = [ ];
                window.history.replaceState(null, null, window.location.pathname);
            }

            // function imageHeight() {
            //     // If thumbnails and caption are present image height will be 100vh - thumbs and caption
            //     // Added this because of crossbrowser css compatibility
            //     if (settings.thumbnails == true) {
            //         thumbHeight = $('.voyage__fullThumbnailsWrap').outerHeight();
            //         console.log('thumbHeight', thumbHeight);
            //     }
            //     if (settings.caption == true) {
            //         captionHeight = $('.voyage__image').find('figcaption').outerHeight();
            //         console.log('captionHeight', captionHeight);
            //     }
                
            //     thumbCaptionHeight = thumbHeight + captionHeight;

            //     var currentImg = $('.voyage__image').find('img');

            //     var voyage__imageWrap = $('.voyage__imageWrap').height() - thumbCaptionHeight;

            //     currentImg.removeAttr("style");
                
            //     if(voyage__imageWrap < currentImg.prop('naturalHeight')) {
            //         currentImg.css('height', 'calc(100vh - ' + thumbCaptionHeight + 'px)');
            //     }
            // }

            $(this).on('keyup', function(e){
                if (e.which == 37) {
                    stopAutoPlay();
                    leftArrow();
                    return false;
                } else if (e.which == 39) {
                    stopAutoPlay();
                    rightArrow();
                    return false;
                } else if (e.which == 27) {
                    stopAutoPlay();
                    closeGallery();
                    return false;
                }
            });

            // Keeping focus because of keyboard events
            $(this).on('click', '.voyage__image', function(){
                openGalImg.focus();
            })
            
            settings.onAfterSliderLoad();
        })
    }

    $(window).resize(function() {
        if(this.resizeTO) clearTimeout(this.resizeTO);
        this.resizeTO = setTimeout(function() {
            $(this).trigger('resizeEnd');
        }, 200);
    });

}(jQuery));