Vue.use(
  new VueSocketIO({
    debug: true,
    connection: "/",
    options: {
      //path: "/my-app/"
    } //Optional options
  })
);

new Vue({
  components: {
    "l-map": window.Vue2Leaflet.LMap,
    "l-tile-layer": window.Vue2Leaflet.LTileLayer,
    "l-marker": window.Vue2Leaflet.LMarker,
    "l-polyline": window.Vue2Leaflet.LPolyline,
    "l-circle": window.Vue2Leaflet.LCircle,
    "l-popup": window.Vue2Leaflet.LPopup
  },
  el: "#example",
  sockets: {
    connect: function() {
      console.log("socket connected");
    },
    request: function(data) {
      console.log("Received", data);
      this.logs += "\r\n" + JSON.stringify(data);
      let ignition = true;
      if (!this.inited) {
        this.center = [data.lat, data.lng];
        this.geofence.center = [data.lat, data.lng];
        this.inited = true;
      } else {
        // Update disatance travelled
        let lastPos = this.markers[data.client];

        this.distance = window.geolib.getDistance(
          { latitude: data.lat, longitude: data.lng },
          {
            latitude: this.geofence.center[0],
            longitude: this.geofence.center[1]
          }
        );
      }
      this.$set(this.markers, data.client, data);
      this.path.push([data.lat, data.lng]);
      this.$socket.emit("ignition", this.ignition);
    }
  },
  methods: {
    updateIgnition: function(e) {
      this.logs += "\r\n Ignition manually set to " + this.ignition;
      this.$socket.emit("ignition", this.ignition);
    }
  },
  data() {
    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      zoom: 10,
      inited: false,
      path: [],

      distance: 0,
      ignition: true,
      logs: "",
      location: window.location + "endpoint",
      geofence: {
        center: [],
        radius: 1000,
        color: "red"
      },
      markers: {},
      center: [48.864716, 2.349014]
    };
  }
});
