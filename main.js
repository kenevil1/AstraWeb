// TODO
/*
- Organize code and split into multiple files
- Have scripts be capable of being uploaded -(DONE)-
- Get scripts to run async and be able to output chunk data of STDOUT
- Stream data from scripts STDOUT to webpages
- Log and store generated webpages URL and STDOUT and display logged data on generated webpages
- Allow user to input to STDIN from generated webpages
*/


const http = require("http");
const fs = require("fs");
const formidable = require('formidable');
const { spawn } = require('child_process');

// html file containing upload form
var index = fs.readFileSync('./www/index.html');
 
// replace this with the location to save uploaded files
var upload_path = './upload_file/';

function main()
{
    // Runs Existing Scripts
    //runExistingScripts(filesFromDir(upload_path));

    //Runs webserver
    webServer();
}

function webServer()
{
    var server = http.createServer((req, res) => {
        //Runs scripts that currently exists
        if (req.url == '/') {
            // if request URL contains '/uploadform'
            // fill the response with the HTML file containing upload form
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(index);
            return res.end();
        } 
        else if (req.url == '/fileupload') 
        {
            fileUpload(req, res);
        }
    }).listen(8080);

    console.log("Listening to port 8080...");

    server.on('connection', (socket) => {
        console.log(`New connection from ${socket.remoteAddress}`);
    });
}

function filesFromDir(directory)
{
    return fs.readdirSync(directory);
}

function fileUpload(req, res)
{
    // if request URL contains '/fileupload'
    // using formiddable module,
    // read the form data (which includes uploaded file)
    // and save the file to a location.
    var form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
        //Only accepts file uploads with name pewdiepie.py as password
        if(files.filetoupload.name == "pewdiepie.py")
        {
            //Real file upload
            //Keep file directory count e.g. pewdiepie1.py...
            var dirSize = filesFromDir("./upload_file");
            // oldpath : temporary folder to which file is saved to
            var oldpath = files.filetoupload.path;
            var filename = 'pewdiepie' + dirSize.length + '.py';
            var newpath = upload_path + filename;

            // copy the file to a new location
            fs.rename(oldpath, newpath, (err) => {
                if (err) throw err;
                // you may respond with another html page
                res.write('File actually uploaded and moved!');
            });

            // Runs uploaded script
            runScript(req, res, newpath);
        }
        else
        {
            //Fake file upload
            res.write('File uploaded and moved! ;)');
            res.end();
        }
    });
}

function runExistingScripts(scriptsLocation)
{
    for(var location in scriptsLocation)
    {
        var run = setTimeout ( function() {
            var script = spawn('python', [location]);
            scriptRunner(req, res, script);
        }, 0);
    }
}

//Runs inputed script and outputs results to web response
function runScript(req, res, location)
{
    var run = setTimeout ( function() {
        var script = spawn('python', [location]);
        scriptRunner(req, res, script);
    }, 0);
}

function scriptRunner(req, res, script)
{
    script.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        res.write(data);
        res.end();
    });

    script.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
        res.write(data);
        res.end();
        script.kill('SIGINT');
    });

    script.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        res.end();
        script.kill('SIGINT');
    });
}

main();