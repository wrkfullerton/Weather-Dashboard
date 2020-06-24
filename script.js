$(document).ready(function () {
    $("#search-button").on("click", function () {
        var searchValue = $("#search-value").val();

        // This clears the input box
        $("#search-value").val("");

        searchWeather(searchValue);
    });

    $(".history").on("click", "li", function () {
        searchWeather($(this).text());
    });

    function makeRow(text) {
        var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
        $(".history").append(li);
    }

    function searchWeather(searchValue) {
        $.ajax({
            type: "GET",
            url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=c97a7ae17c92f387ea6928b1a295ccc6&units=imperial",
            dataType: "json",
            success: function (data) {
                // This creates links for the history of your search results
                if (history.indexOf(searchValue) === -1){
                    history.push(searchValue);
                    window.localStorage.setItem("history", JSON.stringify(history));

                    makeRow(searchValue);
                }

                // This clears out any of the old content
                $("#today").empty();

                // This is to create HTML content from the GET request of current weather

                var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
                var card = $("<div>").addClass("card");
                var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
                var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + " MPH");
                var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " F");
                var cardBody = $("<div>").addClass("card-body");
                var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

                // Merge and add information to the page

                title.append(img);
                cardBody.append(title, temp, humid, wind);
                card.append(cardBody);
                $("#today").append(card);

                // call follow-up API endpoints
                getForecast(searchValue);
                getUVIndex(data.coord.lat, data.coord.lon);
            }
        });
    }

    function getForecast(searchValue) {
        $.ajax({
            type: "GET",
            url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=c97a7ae17c92f387ea6928b1a295ccc6&units=imperial",
            dataType: 'json',
            success: function (data) {
                //overwrite any existing content with title and empty row
                $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

                // loop over all forecasts (by 3-hour increments)
                for (var i = 0; i < data.list.length; i++) {
                    // This only looks at forecast around 3:00pm
                    if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                        // Create HTML elements for a bootstrap card
                        var col = $("<div>").addClass("col-md-2");
                        var card = $("<div>").addClass("card bg-primary text-white");
                        var body = $("<div>").addClass("card-body p-2");

                        var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());

                        var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");

                        var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " F");
                        var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

                        // merge these two cards together and put on the page
                        col.append(card.append(body.append(title, img, p1, p2)));
                        $("#forecast .row").append(col);
                    }
                }
            }
        });
    }

    function getUVIndex(lat, lon) {
        $.ajax({
            type: "GET",
            url: "http://api.openweathermap.org/data/2.5/uvi?appid=c97a7ae17c92f387ea6928b1a295ccc6&lat=" + lat + "&lon=" + lon,
            dataType: "json",
            success: function (data) {
                var uv = $("<p>").text("UV Index: ");
                var btn = $("<span>").addClass("btn btn-sm").text(data.value);

                // Changes color depending on uv value
                if (data.value < 3) {
                    btn.addClass("btn-success");
                }
                else if (data.value < 7) {
                    btn.addClass("btn-warning");                    
                }
                else {
                    btn.addClass("btn-danger");
                }

                $("#today .card-body").append(uv.append(btn));
            }
        });
    }

    // get current history, if any 
        var history = JSON.parse(window.localStorage.getItem("history")) || [];

        if (history.length > 0) {
            searchWeather(history[history.length -1]);
        }

        for (var i = 0; i < history.length; i++) {
            makeRow(history[i]);
        }
    });
