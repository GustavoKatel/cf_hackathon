var request = require('request');
var htmlparser = require('htmlparser2');
var fs = require('fs');
var extract = require('pdf-text-extract');

var db = {};
// var dbFileStream = fs.createWriteStream('')

function downloadPDFs(url) {
  request
    .get('http://www.semobjp.pb.gov.br/itinerarios/', function(error, response, body) {

      var parser = new htmlparser.Parser({
        onopentag: function(name, attribs){
            if(name === 'a' && attribs.href.match(/itinerarios\/.*\.pdf/)){
                var url = attribs.href;
                var curl = 'http://www.semobjp.pb.gov.br/itinerarios/' + url;
                var fname = 'pdfs/'+url.replace(/\//g, '_');

                request.get(curl).pipe(fs.createWriteStream(fname));
            }
        },
      }, {decodeEntities: true});
      parser.write(body);
      parser.end();

    });
}

function extractData() {

  fs.readdir('pdfs/', function(err, files) {
    promises = files.map(function(f) {

      var fname = 'pdfs/'+f;

      extract(fname, function (err, pages) {
        if (err) {
          console.log(err)
          return
        }
        var lines = pages.join('').split('\n');

        var index = 0;

        lines.forEach(function(line, i) {
          if(line.indexOf('SENTIDO')>=0) {
            index = i;
          }
        });

        lines.splice(0, index+1);

        var streets_left = [];
        var streets_right = [];

        lines.forEach(function(line) {

          if(line.indexOf('   ')==0) {
            streets_right.push(line.trim());
          } else {

            var sts = line.trim().split(/\s(\s)+/);
            if(sts.length==1) {
              streets_left.push(sts[0]);
            } else {
              sts.forEach(function(st, index) {

                if(index==0) {
                  streets_left.push(st);
                } else {
                  if(st.trim()!='') {
                    streets_right.push(st);
                  }
                }

              });
            }

          }
        });

        var streets = streets_left.concat(streets_right);

        var bus_number = fname.split('_')[fname.split('_').length-1].replace('.pdf', '');

        db[bus_number] = streets;

        console.log(bus_number);

        console.log(db);

        fs.writeFileSync('paradas.json', JSON.stringify(db));

      });

    });

  });

  // console.log(promises);
  //
  // Promise.all(promises).then(function() {
  //   console.log(db);
  //   fs.writeFileSync('paradas.json', JSON.stringify(db));
  // });

}

extractData();
