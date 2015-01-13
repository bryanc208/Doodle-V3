/*
Doodle App V3
Bryan Cho
http://bryancho.com/DoodleV3
*/

//Initial variables-----------------------------------------------------------------
var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

var clickColor = new Array();
var imageObj = new Image();

var textToFill = '';
var textYLoc = 600;
var textUsed = false;

var MAX_WIDTH = $(window).width()-100;
var MAX_HEIGHT = $(window).height()-180;

var width = 500;
var height = 500;

var currentStep = 0;
var lastStep = 0;
var differences = [];
var curColor = "#222222"

//Functions--------------------------------------------------------------------------
function redraw(){
    context.save();
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.drawImage(imageObj, 0, 0, width, height);
    //drawing
    context.lineJoin = "round";
    context.lineWidth = 5;    
    for(var i=0; i < clickX.length; i++) {		
        context.beginPath();
        if(clickDrag[i] && i){
            context.moveTo(clickX[i-1], clickY[i-1]);
        }else{
            context.moveTo(clickX[i]-1, clickY[i]);
        }
        context.lineTo(clickX[i], clickY[i]);
        context.closePath();
        context.strokeStyle = clickColor[i];        
        context.stroke();
    }    
    context.restore();
	
    //drawing textbox
    context.fillStyle = '#333';
    if(textUsed){
        context.fillRect(0, textYLoc-20, width, 30);  
    }
    
    //typing
    context.font = "15pt Calibri"; 
    context.fillStyle = "#ffffff";
    context.textAlign = 'center';
    var x = canvas.width / 2;
    context.fillText(textToFill, x, textYLoc+2, 470);
}

function clearCanvas()
{
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    clickX = [];
    clickY = [];
    clickDrag = [];
    clickColor  = [];
    imageObj.src = "";
    document.getElementById('textToAdd').value='';
    textToFill = '';
	differences = [];
	textUsed = false;
}

function addClick(x, y, dragging)
{
    if(document.getElementById('draw').checked){
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
        clickColor.push(curColor);
    }else if(document.getElementById('text').checked){
        textYLoc = y;
        textUsed = true;
        $("#textToAdd").css("width", width);
        $("#textToAdd").css("top", textYLoc+21);
		$("#textToAdd").css("background-color", "#333");
    }
}

function handleFileSelect(evt) {
	clearCanvas();
    var files = evt.target.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {

      // Only process image files.
      if (!f.type.match('image.*')) {
        continue;
      }

      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          // Render thumbnail.
          var span = document.createElement('span');
            imageObj.src = e.target.result;
			document.location.href="#/draw";
         /* span.innerHTML = ['<img class="thumb" src="', e.target.result,
                            '" title="', escape(theFile.name), '"/>'].join('');
          document.getElementById('list').insertBefore(span, null); */
        };
      })(f);

      // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    }
  }

function upload() {
    console.log("upload!");
	$("#loading").css("display", "initial");
	var img = canvas.toDataURL("image/png").split(',')[1];
    $.ajax({
        url: 'https://api.imgur.com/3/image',
        type: 'POST',
        headers: { "Authorization": "Client-ID bd9e5b076b91742" },
        dataType: 'json',
        data: {
            image: img
        },
        success: function (data) {
            var url = 'http://imgur.com/' + data.data.id + '?tags';
            $("<a>").html(url).attr("href", url).appendTo($("#container"));
				
			var ImageList = Parse.Object.extend("ImageList");
			var imageList = new ImageList();
			imageList.save({urls: url.replace('?tags','')});
			
			if($('#uploaded').children().length > 0) {
				$('#uploaded').children().remove();
				loadUploaded();
			$("#loading").css("display", "none");
			document.location.href="#/select";			
			}
			
        },
        error: function (response) {
            console.log(response);
        }
    });

}

function loadUploaded(){
	var ImageList = Parse.Object.extend("ImageList");
	var query = new Parse.Query(ImageList);
	query.find({
		success: function(results){
			console.log("successfully retrieved " + results.length + " urls.");
			console.log(results);
			for(var i = results.length-1; i > results.length-6; i--){
				console.log(i);
				var url = results[i].attributes.urls + ".jpg";
				//var base64 = 'data:image/png;base64,' + results[i].attributes.base64;
                    var container =  $("<div>")
                        .appendTo($("#uploaded"));
                    $("<img>")
                        .addClass("uploadedImage")
                        .attr("src", url)
                        .appendTo(container);
			}
		},
		error: function(error){
			console.log(error);
		}
	});
}

function loadPopular(){
	$.ajax({
        url: 'https://api.imgur.com/3/gallery/hot/viral/0.json',
        type: 'GET',
        headers: { "Authorization": "Client-ID c475470ae932a15" },
        success: function (data) {
            console.log(data);
			var count=0;
            for(var i=0; count<5; i++){
                var src = data.data[i].link;
                if(data.data[i].is_album === false && src.indexOf(".gif") === -1){
                    var container =  $("<div>")
                        //.html("<p>"+data.data[i].title+"</p>")
                        .appendTo($("#imgurcontainer"));
                    $("<img>")
                        .addClass("popularImage")
                        .attr("src", src)
                        .appendTo(container);
					count++;
				}
			}
        },
        error: function (response) {
            console.log(response);
        }
    });
}

function animation(){
}        

function getImageData(src){
	$("#loading").css("display", "initial");
		$.getImageData({
			url: src,
			server: "http://bryancho.com/DoodleV3/getImageData.php",
			success: function(image){
				var src2 = image.src;
				imageObj.src = src2;
				document.location.href="#/draw";
				redraw();
			},
			error: function(error){
				console.log(error);
			}
		});
		console.log(src);
}

		
$(document).ready(function(){
	Parse.initialize("53tV1nXbqLAWWDtatcQIjLbKv4X6dOhoxwPZEPsw", "ZUTLwiU5ZLSzw3UU1jHED4jftBFad5SNruRsHx1d");
	
	//Path mapping
	Path.map("#/draw").to(function(){
		$("#uploaded").css("display", "none");
		$("#imgurcontainer").css("display", "none");
		$("#pickImage").css("display", "none");
		$("#loading").css("display", "none");
		$("#container").css("display", "initial");
		$("#top").css("display", "initial");
		$("#canvas").css("display", "initial");		
	}).enter(animation);
	
	Path.map("#/select").to(function(){
		$("#uploaded").css("display", "initial");
		$("#imgurcontainer").css("display", "initial");
		$("#pickImage").css("display", "initial");
		$("#loading").css("display", "none");
		$("#container").css("display", "none");
		$("#top").css("display", "none");
		$("#canvas").css("display", "none");
	})
	
	Path.root("#/select");
	
	Path.listen();
	
	loadUploaded();
	loadPopular();
	
	canvas.width = MAX_WIDTH;
	canvas.height = MAX_HEIGHT;
	width = MAX_WIDTH;
    canvas = document.getElementById('canvas');
    context = canvas.getContext("2d");
	
	document.getElementById('filePick').addEventListener('change', handleFileSelect, false);
    	
	//Load an image into Canvas from imgur---------------------------------------
	$(".imgContainer").on("click", "div img", function(){
		var src = $(this).attr('src');
		getImageData(src);
	});
	
    $('#colorSelector').css('backgroundColor', curColor);
    //Color picker-------------------------------------------------------------
    $('#colorSelector').ColorPicker({
        color: '#222222',
        onShow: function (colpkr) {
            $(colpkr).fadeIn(500);
            return false;
        },
        onHide: function (colpkr) {
            $(colpkr).fadeOut(500);
            return false;
        },
        onChange: function (hsb, hex, rgb) {
            curColor = "#" + hex;
            $('#colorSelector').css('backgroundColor', curColor);
        }
    });
    
	//Image load----------------------------------------------------------------
    imageObj.onload = function() { 
        //maintaining aspect ratio
        width = imageObj.width;
        height = imageObj.height;


        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        context.drawImage(imageObj, 0, 0, width, height);

    }
    imageObj.src = '';

	//Various buttons----------------------------------------------------------------------------
    $('#clearButton').click(function() {
        clearCanvas();
		redraw();
    });
    
    $('#upload').click(function()
	{	upload();
		clearCanvas();
	});
    
    //undo
    $("#undo").click(function(){
        for(var i=0; i<=differences[differences.length-1]; i++){
        clickX.pop();
        clickY.pop();
        clickDrag.pop();
        clickColor.pop();
        }
        redraw();
        differences.pop();
    });
	
	//Textbox to canvas filltext----------------------------------------------------------------
    $('#textToAdd').keyup(function(){
        textToFill = $('#textToAdd').val();
        redraw();
    });
	
	$("#urlPick").keyup(function(e){
		console.log("bye");
		if(e.keyCode === 13){
			console.log("hi");
			var src = $(this).val();
			getImageData(src);
		}
	});
    
	//Make textbox hide when drawing and vice versa---------------------------------------------
	$('#text').change(function(){
		$("#textToAdd").css("display", "initial");
		$("#canvas").css("margin-top", "10px");
	});
	
	$('#draw').change(function(){
		$("#textToAdd").css("display", "none");
		$("#canvas").css("margin-top", "40px");
		if(textToFill === ''){
			textUsed = false;
			redraw();
		}
		
	});
    	
	//Canvas mouse click, movement handler------------------------------------------------------
    $('#canvas').mousedown(function(e){
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop - 100;
        console.log(mouseX);
        console.log(mouseY);

        paint = true;
        if(document.getElementById('draw').checked){
            currentStep = clickX.length;
        }
        addClick(mouseX, mouseY);
        redraw();
    });

    $('#canvas').mousemove(function(e){
        if(paint){
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop - 100, true);
            redraw();
        }
    }); 

    $('#canvas').mouseup(function(e){
        paint = false;
        if(document.getElementById('draw').checked){
            lastStep = clickX.length;
            differences.push(lastStep-currentStep);
        }  
    });

    $('#canvas').mouseleave(function(e){
        paint = false;
		/*
		if(document.getElementById('draw').checked){
            lastStep = clickX.length;
            differences.push(lastStep-currentStep);
        } */
    });
    
	//Canvas touch event handler --------------------------------------------------------------
/* 	canvas.addEventListener('touchmove', function(event) {
	  
	},  false);  */
	
	canvas.addEventListener('touchstart', function(event) {
		event.preventDefault();
	  // If there's exactly one finger inside this element
	  if (event.targetTouches.length == 1) {
		var touch = event.targetTouches[0];
		// draw
        var mouseX = touch.pageX - this.offsetLeft;
        var mouseY = touch.pageY - this.offsetTop - 100;
        console.log(mouseX);
        console.log(mouseY);

        paint = true;
        if(document.getElementById('draw').checked){
            currentStep = clickX.length;
			console.log("done");
        }
        addClick(mouseX, mouseY);
        redraw();
	  }
	}, false);	
	
	canvas.addEventListener('touchmove', function(event) {
		event.preventDefault();
	  // If there's exactly one finger inside this element
	  if (event.targetTouches.length == 1) {
		var touch = event.targetTouches[0];
		// draw
        if(paint){
            addClick(touch.pageX - this.offsetLeft, touch.pageY - this.offsetTop - 100, true);
            redraw();
        }
	  }
	}, false);
	
	canvas.addEventListener('touchend', function(event) {
		// logic
        paint = false;
		console.log("end");
        if(document.getElementById('draw').checked){
            lastStep = clickX.length;
            differences.push(lastStep-currentStep);
			console.log("thisworked");
        } 
	}, false);  
});
