app.filter('duration', function() {
    return function(date) {
        //console.log(date);
        const duration_ms = (new Date()) - (new Date(date));

        const duration_s = Math.floor(duration_ms/1000);
        if(duration_s>59){
            const duration_m = Math.floor(duration_ms/(1000*60));
            if(duration_m>59){
                const duration_h = Math.floor(duration_ms/(1000*60*60));
                if(duration_h>23){
                    const duration_d = Math.floor(duration_ms/(1000*60*60*24));
                    if(duration_d>30){
                        return " months";
                    }
                    return duration_d + " days";
                }
                return duration_h + " hours";
            }
            return duration_m + " minutes";
        }
        return duration_s + " seconds";
    };
})