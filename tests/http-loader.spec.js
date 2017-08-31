"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular/core/testing");
var http_1 = require("@angular/common/http");
var testing_2 = require("@angular/common/http/testing");
var core_1 = require("@ngx-translate/core");
var index_1 = require("../index");
describe('TranslateLoader', function () {
    var injector;
    var translate;
    var http;
    beforeEach(function () {
        testing_1.TestBed.configureTestingModule({
            imports: [
                testing_2.HttpClientTestingModule,
                core_1.TranslateModule.forRoot({
                    loader: {
                        provide: core_1.TranslateLoader,
                        useFactory: function (http) { return new index_1.TranslateHttpLoader(http); },
                        deps: [http_1.HttpClient]
                    }
                })
            ],
            providers: [core_1.TranslateService]
        });
        injector = testing_1.getTestBed();
        translate = testing_1.TestBed.get(core_1.TranslateService);
        http = testing_1.TestBed.get(testing_2.HttpTestingController);
    });
    afterEach(function () {
        injector = undefined;
        translate = undefined;
        http = undefined;
    });
    it('should be able to provide TranslateHttpLoader', function () {
        expect(index_1.TranslateHttpLoader).toBeDefined();
        expect(translate.currentLoader).toBeDefined();
        expect(translate.currentLoader instanceof index_1.TranslateHttpLoader).toBeTruthy();
    });
    it('should be able to get translations', function () {
        translate.use('en');
        // this will request the translation from the backend because we use a static files loader for TranslateService
        translate.get('TEST').subscribe(function (res) {
            expect(res).toEqual('This is a test');
        });
        // mock response after the xhr request, otherwise it will be undefined
        http.expectOne('/assets/i18n/en.json').flush({ "TEST": "This is a test", "TEST2": "This is another test" });
        // this will request the translation from downloaded translations without making a request to the backend
        translate.get('TEST2').subscribe(function (res) {
            expect(res).toEqual('This is another test');
        });
    });
    it('should be able to reload a lang', function () {
        translate.use('en');
        // this will request the translation from the backend because we use a static files loader for TranslateService
        translate.get('TEST').subscribe(function (res) {
            expect(res).toEqual('This is a test');
            // reset the lang as if it was never initiated
            translate.reloadLang('en').subscribe(function (res2) {
                expect(translate.instant('TEST')).toEqual('This is a test 2');
            });
            http.expectOne('/assets/i18n/en.json').flush({ "TEST": "This is a test 2" });
        });
        // mock response after the xhr request, otherwise it will be undefined
        http.expectOne('/assets/i18n/en.json').flush({ "TEST": "This is a test" });
    });
    it('should be able to reset a lang', function (done) {
        translate.use('en');
        spyOn(http, 'expectOne').and.callThrough();
        // this will request the translation from the backend because we use a static files loader for TranslateService
        translate.get('TEST').subscribe(function (res) {
            expect(res).toEqual('This is a test');
            expect(http.expectOne).toHaveBeenCalledTimes(1);
            // reset the lang as if it was never initiated
            translate.resetLang('en');
            expect(translate.instant('TEST')).toEqual('TEST');
            // use set timeout because no request is really made and we need to trigger zone to resolve the observable
            setTimeout(function () {
                translate.get('TEST').subscribe(function (res2) {
                    expect(res2).toEqual('TEST'); // because the loader is "pristine" as if it was never called
                    expect(http.expectOne).toHaveBeenCalledTimes(1);
                    done();
                });
            }, 10);
        });
        // mock response after the xhr request, otherwise it will be undefined
        http.expectOne('/assets/i18n/en.json').flush({ "TEST": "This is a test" });
    });
});
