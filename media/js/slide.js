//Ernesto Valenzuela Vargas
//@programminghack
//Portafolio web en forma de slide 

$(document).ready(function(){
    Slide.Init();

//    setInterval(function(){
//        console.log( $(window).width() + 'px - ' + $(window).height() + 'px' );
//    }, 2000);
});

var Slide = {
    'Actions': new Object(),
    'Variables': new Object(),
    'Objects': new Object(),
    'Helpers': new Object(),
    'Init': function(){
        Slide.Objects.Init();
        Slide.Variables.Init();

        if (Slide.Objects.ContentLoader.length == 0)
        {
            Slide.Actions.InitNavigation();
        }
        else
        {
            Slide.Actions.InitLoader();
        }

        Slide.Actions.InitContactForm();

        $("#arrow").click(function(e){
            e.preventDefault();

            var contentFrame = $('#content-frame');
            if ( contentFrame.length > 0 )
            {
                contentFrame.animate({ 'scrollTop': 0 }, 300);
            }
            else
            {
                $('html, body').animate({ 'scrollTop': 0 }, 300);
            }
        });

        $('#content-frame-mask').css('right', Slide.Helpers.GetScrollBarWidth() + 'px');
    }
};

Slide.Variables = {
    Init: function() {
        this.CookieName = 'Slide_menu_state';
        this.ScreenHashes = new Array();
        Slide.Objects.Flip.children(".slides-pages").each(function(){
            Slide.Variables.ScreenHashes.push( $(this).attr("id").replace("screen-", "") );
        });
    }
};

Slide.Objects = {
    Init: function() {
        this.Flip = $('#flip');
        this.ContentLoader = $('#content-loader');
    }
};

Slide.Actions = {
    'InitLoader': function() {
        var contentLoader = Slide.Objects.ContentLoader;
        var loader = contentLoader.parent();
        var percentValue = contentLoader.find("#percent-value");
        var is100 = false;
        var loaded = 0;

        var intervalId = setInterval(function(){
            loaded += 1;
            is100 = loaded == 100;

            percentValue.text(loaded + '%');

            if ( is100 )
            {
                clearInterval(intervalId);

                setTimeout(function(){
                    loader.hide().parents('.slides-pages').eq(0).addClass('no-mob-loader');

                    Slide.Helpers.SetPageElementByHash();
                    Slide.Objects.Flip.attr('data-attr-page', Slide.Helpers.GetScreenIndexByHash());
                    if (Slide.Objects.Flip.length > 0)
                    {
                        Slide.Actions.InitSlide();
                        Slide.Actions.SetHashChangeEvent();
                    }

                    Slide.Actions.InitNavigation();
                    setTimeout(function(){
                        Slide.Actions.InitFlubber();
                    }, 300);
                }, 200);
            }
        }, 20);
    },

    'InitSlide': function() {
        var flip = Slide.Objects.Flip;
        var currentFlipPage = flip.attr('data-attr-page');
        var flipInitialLeft = flip.position().left;
        var startPos = 0;
        var mouseButtonIsDown = false;
        var maxScroll = -1 * $(window).width() * 4;
        var body = $('body');

        Slide.Objects.Flip.on('mousedown', function(e){
            currentFlipPage = flip.attr('data-attr-page');
            mouseButtonIsDown = true;
            flipInitialLeft = flip.position().left;
            startPos = e.clientX;
        }).on('mousemove', function(e){
            if ( mouseButtonIsDown )
            {
                var diff = e.clientX - startPos;
                var flipNewLeft = flipInitialLeft + diff;
                maxScroll = -1 * $(window).width() * 4;
                flipNewLeft = flipNewLeft > 0 ? 0 : flipNewLeft;
                flipNewLeft = flipNewLeft < maxScroll ? maxScroll : flipNewLeft;
                flip.css('left', flipNewLeft);
                body.addClass('closed-hand');
            }
            if (e.clientX < 150 || e.clientX > $(window).width() - 150)
            {
                body.addClass('hand');
            }
            else
            {
                body.removeClass('hand');
            }
        }).on('mouseup', function(e){
            mouseButtonIsDown = false;
            var diff = e.clientX - startPos;
                body.removeClass('closed-hand');

            if ( Math.abs(diff) > 100 )
            {
                currentFlipPage = parseInt(currentFlipPage) + (diff > 0 ? -1 : 1);
                currentFlipPage = currentFlipPage < 0 ? 0 : currentFlipPage;
                currentFlipPage = currentFlipPage > (Slide.Variables.ScreenHashes.length-1) ? (Slide.Variables.ScreenHashes.length-1) : currentFlipPage;

                window.location.hash = Slide.Variables.ScreenHashes[currentFlipPage];
            }
            if ( Math.abs(diff) < 101 && diff != 0 )
            {
                flip.animate( {'left': flipInitialLeft}, 300);
            }

//            flip.animate( {'left': -1 * endFlipNewLeft}, 300, function(){
//                flip.attr('data-attr-page', currentFlipPage);
//                window.location.hash = Slide.Variables.ScreenHashes[currentFlipPage];
//            });
        });

        $(window).resize(function(){
            var currentFlipPage = flip.attr('data-attr-page');
            Slide.Objects.Flip.css( {'left': -1 * $(window).width() * currentFlipPage });
        });

        $(".site-header").on('mousedown mouseup', function(e){
            e.stopPropagation();
        });
    },

    'SetHashChangeEvent': function(){
        window.onhashchange = function(){
            Slide.Helpers.SetPageElementByHash(true);
        };
    },

};

Slide.Helpers = {
    'SetPageElementByHash': function(animate){
        var hash = window.location.hash;

        var screen = $(hash.replace('#', '#screen-'));
        if (window.location.href.indexOf('case.php') == -1)
        {
            if ( screen.length > 0 )
            {
                var screenIndex = screen.index();
                if ( typeof animate != 'undefined' && animate === true )
                {
                    Slide.Objects.Flip.animate( {'left': -1 * $(window).width() * screenIndex }, 500, function(){
                        Slide.Objects.Flip.attr('data-attr-page', screenIndex);
                    } );
                }
                else
                {
                    Slide.Objects.Flip.css( {'left': -1 * $(window).width() * screenIndex });
                    Slide.Objects.Flip.attr('data-attr-page', screenIndex);
                }

                screen.addClass('mob-active').siblings('.slides-pages').removeClass('mob-active');
            }
            else
            {
                window.location.hash = Slide.Variables.ScreenHashes[0];
            }
        }
    },
    'GetScreenIndexByHash': function( hash ) {
        hash = (typeof hash == 'undefined' ? window.location.hash : hash).replace('#', '');

        for (var i in Slide.Variables.ScreenHashes)
        {
            if ( Slide.Variables.ScreenHashes[i] == hash )
            {
                return i;
            }
        }

        return 0;
    },
    'GetScrollBarWidth': function() {
        var inner = document.createElement('p');
        inner.style.width = "100%";
        inner.style.height = "200px";

        var outer = document.createElement('div');
        outer.style.position = "absolute";
        outer.style.top = "0px";
        outer.style.left = "0px";
        outer.style.visibility = "hidden";
        outer.style.width = "200px";
        outer.style.height = "150px";
        outer.style.overflow = "hidden";
        outer.appendChild (inner);

        document.body.appendChild (outer);
        var w1 = inner.offsetWidth;
        outer.style.overflow = 'scroll';
        var w2 = inner.offsetWidth;
        if (w1 == w2) w2 = outer.clientWidth;

        document.body.removeChild (outer);

        return (w1 - w2);
    }
};