let heroSlider;
let st;
let coords;
let map;
let isUpdating;

$(() => {
    
    $('.lazy').lazy();

    heroSlider = new Swiper( document.querySelector('#main-hero'), {
        pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
            clickable: true
        },
        autoplay: {
            delay: 4000
        },
        speed: 800,
        loop: true
    });
    initEvents();
    
});

function initEvents(){
    heroSlider.on('slideChange', () => { $('.lazy').lazy(); });
    $('body').on('click', '#burger', toggleMenu);
    $('body').on('click', closeBurger);
    $('.price-header').on('click', accordionPriceBlock);
    updateNavbar();
}

function closeBurger(){

    let elArray = composedPath(this);
    $('.mobile-wrapper').removeClass('active');
}

function toggleMenu(e){
    e.preventDefault();
    $('.mobile-wrapper').toggleClass('active');
    e.stopImmediatePropagation();
}

function accordionPriceBlock(){

    let $wrapper = $(this).parents('.price-section').find('.price-wrapper');
    $wrapper.toggleClass('active');

    $(this).toggleClass('active');

    if( $(window).outerWidth() < 800 ){
        let st = $(this).offset().top - 60;
        $('html, body').scrollTop(st);
    }

}

function updateNavbar(){

    st = $('html, body').scrollTop();

    if ( !isUpdating ){

        isUpdating = true;

        if( st >= 300 ){
            $('header').addClass('fixed');
        }else{
            $('header').removeClass('fixed');
        }

        setTimeout(() => {
            isUpdating = false
        }, 400);
    }

    requestAnimationFrame(updateNavbar);

}

var initPhotoSwipeFromDOM = function(gallerySelector) {

    // parse slide data (url, title, size ...) from DOM elements 
    // (children of gallerySelector)
    var parseThumbnailElements = function(el) {
        var thumbElements = el.childNodes,
            numNodes = thumbElements.length,
            items = [],
            figureEl,
            linkEl,
            size,
            item;

        for(var i = 0; i < numNodes; i++) {

            figureEl = thumbElements[i]; // <figure> element

            // include only element nodes 
            if(figureEl.nodeType !== 1) {
                continue;
            }

            linkEl = figureEl.children[0]; // <a> element

            size = linkEl.getAttribute('data-size').split('x');

            // create slide object
            item = {
                src: linkEl.getAttribute('href'),
                w: parseInt(size[0], 10),
                h: parseInt(size[1], 10)
            };



            if(figureEl.children.length > 1) {
                // <figcaption> content
                item.title = figureEl.children[1].innerHTML; 
            }

            if(linkEl.children.length > 0) {
                // <img> thumbnail element, retrieving thumbnail url
                item.msrc = linkEl.children[0].getAttribute('src');
            } 

            item.el = figureEl; // save link to element for getThumbBoundsFn
            items.push(item);
        }

        return items;
    };

    // find nearest parent element
    var closest = function closest(el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };

    // triggers when user clicks on thumbnail
    var onThumbnailsClick = function(e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        var eTarget = e.target || e.srcElement;

        // find root element of slide
        var clickedListItem = closest(eTarget, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        });

        if(!clickedListItem) {
            return;
        }

        // find index of clicked item by looping through all child nodes
        // alternatively, you may define index via data- attribute
        var clickedGallery = clickedListItem.parentNode,
            childNodes = clickedListItem.parentNode.childNodes,
            numChildNodes = childNodes.length,
            nodeIndex = 0,
            index;

        for (var i = 0; i < numChildNodes; i++) {
            if(childNodes[i].nodeType !== 1) { 
                continue; 
            }

            if(childNodes[i] === clickedListItem) {
                index = nodeIndex;
                break;
            }
            nodeIndex++;
        }



        if(index >= 0) {
            // open PhotoSwipe if valid index found
            openPhotoSwipe( index, clickedGallery );
        }
        return false;
    };

    // parse picture index and gallery index from URL (#&pid=1&gid=2)
    var photoswipeParseHash = function() {
        var hash = window.location.hash.substring(1),
        params = {};

        if(hash.length < 5) {
            return params;
        }

        var vars = hash.split('&');
        for (var i = 0; i < vars.length; i++) {
            if(!vars[i]) {
                continue;
            }
            var pair = vars[i].split('=');  
            if(pair.length < 2) {
                continue;
            }           
            params[pair[0]] = pair[1];
        }

        if(params.gid) {
            params.gid = parseInt(params.gid, 10);
        }

        return params;
    };

    var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
        var pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items;

        items = parseThumbnailElements(galleryElement);

        // define options (if needed)
        options = {

            // define gallery index (for URL)
            galleryUID: galleryElement.getAttribute('data-pswp-uid'),

            getThumbBoundsFn: function(index) {
                // See Options -> getThumbBoundsFn section of documentation for more info
                var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect(); 

                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            }

        };

        // PhotoSwipe opened from URL
        if(fromURL) {
            if(options.galleryPIDs) {
                // parse real index when custom PIDs are used 
                // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
                for(var j = 0; j < items.length; j++) {
                    if(items[j].pid == index) {
                        options.index = j;
                        break;
                    }
                }
            } else {
                // in URL indexes start from 1
                options.index = parseInt(index, 10) - 1;
            }
        } else {
            options.index = parseInt(index, 10);
        }

        // exit if index not found
        if( isNaN(options.index) ) {
            return;
        }

        if(disableAnimation) {
            options.showAnimationDuration = 0;
        }

        // Pass data to PhotoSwipe and initialize it
        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
    };

    // loop through all gallery elements and bind events
    var galleryElements = document.querySelectorAll( gallerySelector );

    for(var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i+1);
        galleryElements[i].onclick = onThumbnailsClick;
    }

    // Parse URL and open gallery if it contains #&pid=3&gid=1
    var hashData = photoswipeParseHash();
    if(hashData.pid && hashData.gid) {
        openPhotoSwipe( hashData.pid ,  galleryElements[ hashData.gid - 1 ], true, true );
    }
};

if ( $('.my-gallery').length ){
        
    initPhotoSwipeFromDOM('.my-gallery');
}

//= Асинхронная загрузка скриптов =========================================
let loadScript = (url, callback) => {

    var script = document.createElement("script")
    script.type = "text/javascript";
    
    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

if($('#map').length){
    loadScript("https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.4.3/build/ol.js", () => {
        initMap();
    })
}

//= Инициализация карты ===================================================
function initMap(){

    var params, paramsObj;
    
    if(location.search != ""){
        params = location.search.substring(1);
        paramsObj = JSON.parse('{"' + decodeURI(params).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    }

    if(!paramsObj){
        coords = [38.931331, 44.980265];
    }else{
        coords = [parseFloat(paramsObj.lan), parseFloat(paramsObj.lat)]
    }
    
    
    var style = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [.5, 1],
            src: '/img/map_marker.png'
        })
    });
    
    var marker = new ol.Feature({
        type: 'icon',
        geometry: new ol.geom.Point(ol.proj.fromLonLat(coords))
    })
    
    var vectorSource = new ol.source.Vector({
        features: [marker]
    })
    
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: style
    });
    
    // Shift map center to provide place for overlay
    var center = [
        coords[0], 
        coords[1]
    ]
    
    map = new ol.Map({
        target: 'map',  // The DOM element that will contains the map
        interactions: ol.interaction.defaults({mouseWheelZoom:false}), //Disable scroll event
        renderer: 'canvas', // Force the renderer to be used
        tap:false,
        layers: [
            // Add a new Tile layer getting tiles from OpenStreetMap source
            new ol.layer.Tile({
                source: new ol.source.OSM({
                    url: "https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png"
                })
            }),
            vectorLayer
        ],
        // Create a view centered on the specified location and zoom level
    
        view: new ol.View({
            center: ol.proj.fromLonLat(center),
            zoom: 17
        })
    });  
    
    // Эвент по клику на маркере
    map.on('click', function(evt) {
        var f = map.forEachFeatureAtPixel(
            evt.pixel,
            function(ft, layer){return ft;}
        );
        if (f && f.get('type') == 'icon') {
            var linkEl = $('<a href="https://goo.gl/maps/ginpBuogo7nZaVxH6" target="_blank">Google</a>');
            $('#map').append(linkEl);
            linkEl[0].click();
            $(linkEl).remove();
        }        
    });
    
    map.on("pointermove", function (evt) {
        var hit = this.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
            return true;
        }); 
        if (hit) {
            this.getTargetElement().style.cursor = 'pointer';
        } else {
            this.getTargetElement().style.cursor = '';
        }
    });
}

function composedPath (el) {

    var path = [];

    while (el) {

        path.push(el);

        if (el.tagName === 'HTML') {

            path.push(document);
            path.push(window);

            return path;
       }

       el = el.parentElement;
    }
}