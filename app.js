var map;
var infowindow;
var locations = [{
        title: 'Golden temple, Punjab',
        location: {
            lat: 31.633979,
            lng: 74.872264
        },
        location_id: "58591200d25ded6fd733d464"
    },
    {
        title: 'Haveloc, Port Blair',
        location: {
            lat: 11.97605,
            lng: 92.987556
        },
        location_id: "4f9db93b1081e4cc15138eec"
    },
    {
        title: 'Monastry, Spiti Valley',
        location: {
            lat: 32.246137,
            lng: 78.034916
        },
        location_id: "53771c71498ee3757154db4b"
    },
    {
        title: 'Dal Lake, Srinagar',
        location: {
            lat: 34.083671,
            lng: 74.797282
        },
        location_id: "539f9a3f498efdb7c0008746"
    },
    {
        title: 'Rameswaram, Tamil Nadu',
        location: {
            lat: 9.287625,
            lng: 79.312929
        },
        location_id: "507fbe93d86ce9ff38f34c3a"
    },
    {
        title: 'Jaipur, Rajasthan',
        location: {
            lat: 26.912434,
            lng: 75.787271
        },
        location_id: "4bc7875393bdeee12a7c37ae"
    },
    {
        title: 'Dhuandhar falls, MP',
        location: {
            lat: 23.125601,
            lng: 79.812939
        },
        location_id: "4cb156661463a143520ca5a9"
    },
    {
        title: 'Tirupati, AP',
        location: {
            lat: 13.628756,
            lng: 79.419179
        },
        location_id: "4dbb3b6b1e72b351ca9413eb"
    },
    {
        title: 'Bodhgaya, Bihar',
        location: {
            lat: 24.795452,
            lng: 84.999431
        },
        location_id: "589454baa8b75947f54c1efd"
    },
    {
        title: 'Netarhat, Chattisgarh',
        location: {
            lat: 23.485434,
            lng: 84.264752
        },
        location_id: "5574b5b7498e265bc23bf9d1"
    },
    {
        title: 'Agra, UP',
        location: {
            lat: 27.17667,
            lng: 78.008075
        },
        location_id: "4b53fce2f964a52014b027e3"
    }
];

function initMap() {
    var styles = [{
            "featureType": "administrative.country",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#012413"
            }]
        },
        {
            "featureType": "administrative.province",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#050000"
            }]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#e18712"
            }]
        },
        {
            "featureType": "road.highway.controlled_access",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#ec0000"
            }]
        }
    ]; //will be added later on
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 20.593684,
            lng: 78.96288
        },
        maxZoom: 12,
        minZoom: 1,
        zoom: 4,
        styles: styles,
        mapTypeControl: false
    }); //map closed

    infowindow = new google.maps.InfoWindow();

    ko.applyBindings(new ViewModel());

} //initMap closed

var ViewModel = function() {

    var place = function(data, map) {
        var self = this;
        this.title = ko.observable(data.title);
        this.location = data.location;
        this.marker = "";
        this.location_id = ko.observable(data.location_id);
        this.shortUrl = "";
        this.photoUrl = "";
    };

    var that = this;
    var bounds = new google.maps.LatLngBounds();

    this.placeList = ko.observableArray();
    locations.forEach(function(item) {
        that.placeList.push(new place(item));
    });

    that.placeList().forEach(function(place) {

        var marker = new google.maps.Marker({
            map: map,
            position: place.location,
            animation: google.maps.Animation.DROP,
            icon: "img/4.png",
            visible: true
        });

        place.marker = marker;
        bounds.extend(marker.position);


        marker.addListener("click", function(e) {
            infowindow.setContent(getContent(place));
            infowindow.open(map, marker);
            toggleBounce(marker);
        });
    }); //placeList with function of working marker over

    function getContent(place) {
        var contentString = "<h2 style='color:black;'>" + place.title() + "</h2><br><div style='width:150px;height:150px'><img src=" + '"' + place.photoUrl + '"></div><div><a href="' + place.shortUrl + '">More info in Foursquare</a></div>';

        var errorString = "Foursquare content not available";

        if (place.shortUrl.length > 0) {
            return contentString;
        } else {
            return errorString;
        }
    } //function getContent closed

    function toggleBounce(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 2000);
        }
    } //toggleBounce closed


    that.getFoursquareData = ko.computed(function() {
        that.placeList().forEach(function(place) {
            var llLat = place.location.lat;
            var llLng = place.location.lng;
            var venueID = place.location_id();

            var foursquareUrl = "https://api.foursquare.com/v2/venues/" + venueID + "/photos?";

            $.ajax({
                type: "GET",
                url: foursquareUrl,
                data: {
                    client_id: "B2BVDXFJXCG0DLCGQQ4UR1QYQ4CHNARAMMELHE434CJS13L3",
                    client_secret: "EBJQSQGZD1YCY4JA3YWG200LS41NDKWO2XPGFKDUYCIY252K",
                    v: "20170704"
                },
                dataType: "json",
                cache: false,
                success: function(data) {
                    var response = data.response ? data.response : "";
                    var photos = response.photos ? data.photos : "";

                    place.shortUrl = response.photos.items[0].source.url;
                    place.photoUrl = response.photos.items[0].prefix + "height150" +
                        response.photos.items[0].suffix;
                }
            }).error(function(e){
              alert("Foursquare data could not be retrieved");
              return;
              //$("#text").html('Sorry! foursquare, could Not Be Loaded');
              //that.errorMessage = function(){
              //console.log("Info not available");
              //infowindow.setContent('Info not available');
            }); //ajax call completed
        });
    }); //foursquare call for response completed


    that.itemClick = function(place) {
        google.maps.event.trigger(place.marker, "click");
    };

    that.search = ko.observable('');
    //to do a search through the list
    that.userSearch = ko.computed(function() {
        var search = this.search().toLowerCase();
        if (!search) {
          that.placeList().forEach(function(place){
            place.marker.setVisible(true);
          });
            return this.placeList();
        } else {
            return ko.utils.arrayFilter(this.placeList(), function(place) {
              //return place.title().toLowerCase().indexOf(search) !== -1;
               if (place.title().toLowerCase().indexOf(search) !== -1) {
                     place.marker.setVisible(true);
                    return true;
                } else {
                     place.marker.setVisible(false);
                    return false;
                }

            });

        }


    }, this); //userSearch closed

that.reset = function(){
that.placeList().forEach(function(place){
  place.marker.setVisible(true);
});
};// to set visibility of all markers as true after the last element in search gets deleted

}; //viewModel closed

//To display the error message
function mapError() {
    alert("Oops, Map could not get loaded. Please check the internet connection.");
}
