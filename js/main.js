var eatme = {};

(function(){

    eatme.baseUrl = 'http://172.27.0.53:9999/api';

    eatme.Dish = Backbone.Model.extend({

    });

    eatme.Dishes = Backbone.Collection.extend({
        model: eatme.Dish
    });

    eatme.Category = Backbone.Model.extend({
        initialize: function(){
            var dishes = this.get('Dishes').map(function(dish){
                return new eatme.Dish(dish);
            });
            this.set('Dishes', new eatme.Dishes(dishes));
        }
    });

    eatme.Categories = Backbone.Collection.extend({
        model: eatme.Category
    });

    eatme.Cafe = Backbone.Model.extend({
        initialize: function(){
            this.fetch();
        },

        fetch: function(){
            var cafe = this;
            $.ajax({
                url: eatme.baseUrl + '/cafes/' + this.get('Id') + '?withContent=true',
                method: 'GET',
                dataType: 'json'
            }).done(function(response){
                cafe.setCategories(response.Categories);
                cafe.trigger('loaded');
            });
        },

        setCategories: function(data){
            var categories =  data.map(function(category){
                return new eatme.Category(category);
            });
            this.set('Categories', new eatme.Categories(categories));
            console.log(this);
        }

    });

    eatme.Cafes = Backbone.Collection.extend({
        model: eatme.Cafe,

        initialize: function(){
            this.fetch();
        },

        fetch: function(){
            var cafes = this;
            $.ajax({
                url: eatme.baseUrl + '/cafes',
                method: 'GET',
                dataType: 'json'
            }).done(function(response){
                console.log(response);
                cafes.populate(response);
            });
        },

        populate: function(data){
            this.add(data.map(function(obj){
                return new eatme.Cafe(obj);
            }));
            console.log(this);
            this.trigger('ready');
        }
    });

    /*

    eatme.CafeView = Backbone.View.extend({
        className: 'grid_4 restaurant-block',
        template: doT.template($('#cafeTemplate').html()),
        render: function(){
            this.$el.html(this.template(this.model.attributes));
        }
    });

    eatme.CafeListView = Backbone.View.extend({

        initialize: function(){

            var list = this;
            this.model.on('ready', function(){
                list.cafes = list.model.models.map(function(cafe){
                    return new eatme.CafeView({
                        model: cafe
                    });
                });
                list.render();
            });

        },

        render: function(){
            this.$el.empty();
            this.cafes.forEach(function(cafeView){
                cafeView.render();
            });
        }
    });

    var cafes = new eatme.Cafes();



    var cafeList = new eatme.CafeListView({
        model: cafes,
        el: $('.content .container_12').first()
    });

*/

    var cafes = new eatme.Cafes();

    var cafeTemplate = doT.template($('#cafeTemplate').html());
    var cafeTemplateFull = doT.template($('#cafeTemplateFull').html());

    cafes.on('ready', function(){
        var container = $('.content .container_12').first().empty();
        cafes.models.forEach(function(cafe){
            container.append(cafeTemplate(cafe.attributes));
        });
    });


/***** search ******/

    $('.search-part input').on('keydown', function(){
        var that = this;
        setTimeout(function(){
            var text = $(that).val().toLowerCase();
            $('.restaurant-block').each(function(){
                var cafe = $(this);
                var title = cafe.find('.info-part a').html().toLowerCase();
                console.log(title);
                if (title.indexOf(text) !== -1) {
                    cafe.show();
                } else {
                    cafe.hide();
                }
            });
        }, 10);

    });


    eatme.Router = Backbone.Router.extend({

        routes: {
            "cafe/:id":              "cafe",
            "menu":                 "menu",
            "*action":              "home"
        },

        home: function(){
            $('.page').hide();
            $('.landing.page').show();
            $('.header .logo a').hide();
            $('.header .logo h1').show();
        },

        test: function() {
            console.log('routing test');
        },

        cafe: function(id) {
            var cafe = cafes.find(function(model){
                return model.get('Id') == id;
            });
            console.log(cafe);

            $('.restaurant.page .about-block').replaceWith(cafeTemplateFull(cafe.attributes));
            $('.page').hide();
            $('.restaurant.page').show();
            $('.header .logo h1').hide();
            $('.header .logo a').show();
        },

        menu: function(){
            $('.page').hide();
            $('.menu.page').show();
            $('.header .logo h1').hide();
            $('.header .logo a').show();
        },

        last: function(){
            console.log('default route');
        }

    });

    var router = new eatme.Router();
    router.navigate('/', {pushState: true});

    Backbone.history.start();






}());