'use strict';
describe("associations-restful", function() {

    var $restful, callback, $httpBackend;

    beforeEach(module('restful'));

    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $restful = $injector.get('$restful');
        callback = jasmine.createSpy();
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    it('should create routes', function() {
        $httpBackend.when('GET', '/Path').respond([{id:1}, {id:2}]);
        $httpBackend.when('GET', '/Path/1').respond({id:1});
        $httpBackend.when('GET', '/Path/2').respond({id:2});
        var Parent = $restful('/Path/:id');

        var paths = Parent.query(function(){
            for( var i = 0; i < paths.length; i++){
                var path = paths[i];
                expect(path.$getUrl()).toEqualData('/Path/'+path.id);
            }
        });

        var path1 = new Parent({id:1});
        expect(path1.$getUrl()).toEqualData('/Path/1');

        var path2 = Parent.get({id:2}, function(){
            expect(path2.$getUrl()).toEqualData('/Path/2');
        });

    });

    /*it('should create route', function() {
        var Parent = $restful('/Parent');
        var Child = $restful('/Child');

        $httpBackend.when('GET', '/Parent').respond('{}');
        $httpBackend.when('GET', '/Child').respond('{}');
        $httpBackend.when('GET', '/Parent/Child').respond('{}');

        var parent = Parent.get();
        Child.get();
        Child.get([parent]);
    });*/

});