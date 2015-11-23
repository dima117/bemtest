(function(lib){

    var hash = lib.hash = {

        getHashCode: function (obj) {
            var hashSourceString = obj && typeof obj.getHashSourceString === 'function'
                    ? obj.getHashSourceString() + ''
                    : JSON.stringify(obj) + '';

            return hash.getStringHashCode(hashSourceString, true);
        },

        getStringHashCode: function(str, asString, seed) {
            var i, l, hval = (seed === undefined) ? 0x811c9dc5 : seed;

            for (i = 0, l = str.length; i < l; i++) {
                hval ^= str.charCodeAt(i);
                hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
            }

            if(asString){
                return ('0000000' + (hval >>> 0).toString(16)).substr(-8);
            }

            return hval >>> 0;
        }
    };

})(window.lib);
