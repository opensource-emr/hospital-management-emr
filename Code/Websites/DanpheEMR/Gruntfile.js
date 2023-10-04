module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-shell');
    grunt.initConfig({
        pkg: grunt.file.readJSON('appsettings.json'),
        shell: {
          //  command: ["cd <%= pkg.ngbuildpath %>", "ng build --watch"].join('&&')
            command: ["cd <%= pkg.ngbuildpath %>", "ng build --watch --deploy-url=/DanpheApp/dist/DanpheApp/"].join('&&')
        }     
    });
    grunt.registerTask('default', ['shell']);
};
