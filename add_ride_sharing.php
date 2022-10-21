<?php 
   include("config/config.php");
   
   include("inc/head.php");
   
   include("inc/header.php");
   
   include("inc/sidebar.php");
   
    ?>
<?php

   if (isset($_GET['id'])) {
   
      $id = $_GET['id'];
   
      $edit_post = $db->SelectSRow(array("*"),"rentals","id=$id AND user_id=$user_id");
   
   }
   
   
   
   if(isset($_POST["submit"])) {
   
   extract($_POST);
   
   
   
   
   $post_array=array(
     "title"=>htmlspecialchars($title),
    "tag_line"=>htmlspecialchars($tag_line),
     "content"=>htmlspecialchars($content),
     "user_id"=>$user_id,
     "posted_by"=>$user_id,
      "vehicle"=>$vehicle,
      "total_seats"=>$total_seats,
      "start_time"=>$start_time,
      "ride_date"=>$ride_date,
      "route"=>$route,
      "is_repeat"=>$event_repeat,
      "post_date"=>date("Y/m/d H:i:s"),
      "expiry_date"=>$event_date,  
     "list"=>$list,
     "is_published"=>$status,
     "is_global"=>$is_global,
   
   );
   if ($event_repeat!="0") {

  $post_array['repeat_on']=$repeat_on;
  

}


   
    if (isset($_GET['id']) AND !isset($_GET['edit_as_new'])) {
   
               $post = $db->updateCondition($post_array,"ride_sharing","id=$id AND user_id=$user_id");
               
               $db->updateCondition(array("is_global"=>$is_global,"title"=>$title,"tag_line"=>$tag_line),"timeline","user_id=$user_id AND table_id=8 AND row_id=$post");
                  
               if ($post) {
                   $_SESSION['status'] = 1;
   
                   $_SESSION['flash_message'] = $lang_post_updated;
   
   
   
               
   
               }
   
               
   
             }else{
   
               $post=$db->insert($post_array,"ride_sharing");
               $db->insert(array("user_id"=>$user_id,"table_id"=>9,"row_id"=>$post,"is_global"=>$is_global,"insertion_date"=>date("Y-m-d H:i:s"),"title"=>$title,"tag_line"=>$tag_line),"timeline");
   
   
                 if ($post) {
   
                   $_SESSION['status'] = 1;
   
                   $_SESSION['flash_message'] = $lang_post_added;
   
   
   
                 }else{
   
                   $_SESSION['status'] = 0;
   
                   $_SESSION['flash_message'] = $lang_some_thing_wrong;
   
                 }
   
             }
   
   
   
   if ($post) {
 
   ?>
<script type="text/javascript">
   window.location.href="my_ride_sharings.php";
   
</script>
<?php 
   }} ?>
   <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <script src="ridesharing/js/leaflet.contextmenu.js"></script>
    <script src="ridesharing/js/leaflet.contextmenu.min.js"></script>
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
    />
    <link rel="stylesheet" href="ridesharing/css/leaflet.contextmenu.css" />
    <link rel="stylesheet" href="ridesharing/css/leaflet.contextmenu.min.css" />
    <link rel="stylesheet" href="ridesharing/css/leaflet.photon.css" />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css"
    />
    <script src="ridesharing/js/Control.Geocoder.js"></script>
    <script src="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js"></script>
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css"
    />
<style type="text/css">
   input[type="time"]::-webkit-calendar-picker-indicator {

   background: none;

   }
   .hidden{
    display: none;
  }
   input::-webkit-outer-spin-button,
   input::-webkit-inner-spin-button {
   -webkit-appearance: none;
   margin: 0;
   }
   /* Firefox */
   input[type=number] {
   -moz-appearance: textfield;
   }
.leaflet-routing-geocoder{
   display: flex;
}
.leaflet-routing-container{
   width: 100% !important;
}
.leaflet-routing-alternatives-container{
   display: none !important;
}
.leaflet-bar{
   box-shadow: none !important;
}
.leaflet-control-geocoder-alternatives{
       height: 100px;
    overflow-y: scroll;
    z-index: 3924723987439;
    position: fixed;
    background: white;
}
</style>
<div class="page-body">
   <div class="container-fluid p-lr-0">
      <div class="page-header pb-0">
         <div class="row">
            <div class="col-sm-12">
               <h4 class="pages-heading fw-bold pb-2 mt-3 p-l-15"><?php if (isset($_GET['id'])) {
                  echo $lang_edit_rental;
               }else{
                  echo $lang_add_rental;
               } ?></h4>
            </div>
         </div>
      </div>
      <!-- Container-fluid starts-->
      <div class="container-fluid">
         <div class="row">
            <div class="col-sm-12 p-lr-0">
               <div class="card m-b-150">
                  <div class="card-body add-post add_content_form">
                        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                           <div class="row">
                              <div class="col-lg-12 co-md-12">
                                 <div class="form-group">
                                    <label class="mb-0" ><?= $lang_title; ?>: <span class="textCounter titleCharacter"><span id="title_counter"><?php if(isset($_GET['id'])){echo strlen(htmlspecialchars_decode($edit_post['title']));}else{echo "0";} ?></span>/60</span></label>
                                    <p class="mt-0 mb-1"><small><?= $lang_prod_title_textt;?></small></p>
                                    <input class="form-control required_field" type="text" maxlength="60" name="title" value="<?php if(isset($_GET['id'])){echo $edit_post['title'];} ?>">
                                 </div>
                              </div>
                              
                           </div>
                        </div>
                        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                           <div class="form-group">
                              <label class="mb-0" ><?= $lang_tag_line?>: <span class="textCounter"><span id="tag_line_counter"><?php if(isset($_GET['id'])){echo strlen(htmlspecialchars_decode($edit_post['tag_line']));}else{echo "0";} ?></span>/120</span></label>
                              <p class="mt-0 mb-1"><small><?= $lang_prod_tag_line_text; ?></small></p>
                              <input class="form-control" type="text" autocomplete="off" maxlength="120" name="tag_line" value="<?php if(isset($_GET['id'])){echo $edit_post['tag_line'];} ?>">
                           </div>
                        </div>
                        <div class="col-lg-9 col-md-9 col-sm-9 col-xs-9">
                           <div class="form-group">
                              <label class="mb-0" >Vehicle: </label>
                              <p class="mt-0 mb-1"><small>Details of your vehicle</small></p>
                              <input class="form-control" type="text" autocomplete="off" maxlength="120" name="vehicle" value="<?php if(isset($_GET['id'])){echo $edit_post['vehicle'];} ?>">
                           </div>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">

                              <div class="form-group">

                                 <label class="d-block mb-0"><?= $lang_total_seats; ?></label>

                                 <p class="mt-0 mb-1"><small>Total capacity of your vehicle</small></p>

                                 <input type="number" min=0 class="form-control " id="total_seats" name="total_seats" value="<?php if(isset($_GET['id'])){echo $edit_post['total_seats'];}else{echo "";} ?>">

                              </div>

                           </div>
                            <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">

                              <div class="form-group">

                                 <label class="d-block mb-0"><?= $lang_event_on; ?></label>

                                 <p class="mt-0 mb-1"><small><?= $lang_one_time_or_course; ?></small></p>

                                 <select class="form-control customSelect" name="event_repeat" id="event_repeat">

                                    <option value="0" <?php if(isset($_GET['id']) && $edit_post['is_repeat']==0){echo "selected";} ?>> <?= $lang_event_on_one_time; ?></option>

                                    <option value="1" <?php if(isset($_GET['id']) && $edit_post['is_repeat']==1){echo "selected";} ?>><?= $lang_event_on_Course; ?></option>

                                 </select>

                              </div>

                           </div>

                           <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12" >

                              <div class="form-group">

                                 <label class="d-block mb-0" id="repeat_date_text"><?= $lang_date; ?></label>

                                 <p class="mt-0 mb-1"><small><?= $lang_event_date_or_first_date; ?></small></p>

                                 <input required min="<?php if(isset($_GET['id'])){echo date('Y-m-d',strtotime($edit_post['expiry_date']));}else{ echo date("Y-m-d");} ?>"  type="date" class="form-control one_default" name="ride_date" value="<?php if(isset($_GET['id'])){echo $edit_post['ride_date'];} ?>">

                              </div>

                           </div>

                           <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12" <?php if(isset($_GET['id']) && $edit_post['is_repeat']!=0){echo "style='display:block'";}else{echo "style='display:none'";} ?> id="repeat_on_div" >

                              <div class="form-group" >

                                 <label class="d-block mb-0"><?= $lang_every; ?></label>

                                 <p class="mt-0 mb-1"><small> <?= $lang_interval; ?></small></p>

                                 <input  type="text" class="form-control one_default" name="repeat_on" value="<?php if(isset($_GET['id'])){echo $edit_post['repeat_on'];} ?>">

                              </div>

                           </div>

                          

                           <div class="col-lg-12 col-md-12">

                              <div class="row">

                                 <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12" >

                                    <div class="form-group">

                                       <label class="d-block mb-0"><?= $lang_start_time; ?></label>

                                       <p class="mt-0 mb-1"><small><?= $lang_when_the_event_starts; ?></small></p>

                                       <input required  type="time" class="form-control one_default" name="start_time" value="<?php if(isset($_GET['id'])){echo $edit_post['start_time'];} ?>">

                                    </div>

                                 </div>

                       
                        <div class="container">
      <div class="row">
        <div class="col-md-12 mt-3">
         <div class="d-flex">
            <img src="https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png" class="m-r-5">
            <input
              type="text"
              id="start"
              placeholder="Start"
              class="waypointAddresses form-control"
            />
            <button id="removeStartBtn" class="hidden btn btn-danger p-0">Remove</button>
         </div>
            
        </div>

        <div class="col-md-12 mt-3">
         
            <ul id="intermediate">
              <li>
               <div class="d-flex">
                  <img src="https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png" class="m-r-5">

                <input
                  type="text"
                  id="intermediate1"
                  placeholder="Intermediate"
                  class="waypointAddresses form-control"
                />
             </div>
              </li>
            </ul>
         
            
        </div>
        <div class="col-md-12 mt-3">
            <ul id="optional">
              <li>
               <div class="d-flex">
               <img src="https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png" class="m-r-5">
               
                <input
                  type="text"
                  id="optional1"
                  placeholder="Optional"
                  class="waypointAddresses form-control"
                />
             </div>
              </li>
            </ul>
            
            
        </div>

        <div class="col-md-12 mt-3">
          
            <div class="d-flex">
               <img src="https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png" class="m-r-5"><input
              type="text"
              id="end"
              placeholder="End"
              class="waypointAddresses form-control"
            />
            <button id="removeEndBtn" class="hidden btn btn-danger p-0">Remove</button>
            </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12 mt-3">
          <div id="map" class="col-md-12" style="height: 500px"></div>
          
          
        </div>
        <div class="col-md-9"></div>
      </div>
    </div>
    <div>
      Route Export
      <div id="routeExport"></div>
      Waypoints Export
      <div id="waypointsExport"></div>
      Combined Export
      <div id="combinedExport"></div>
    </div>
    <div class="row">
      <div class="col-md-3">
        <input type="button" id="loadGeojson" value="Click to load above json in map below"></input>
      </div>
      <div id="map2" class="col-md-12" style="height: 500px"></div>
    </div>
                        
                        <div class="email-wrapper">
                           <div class="theme-form">
                              <div class="form-group">
                                 <label class="mb-0"><?= $lang_content; ?>:
                                 <span class="textCounter"><?= $lang_max_800; ?></span>
                                 </label>
                                 <p class="mt-0 mb-1"><small><?= $lang_prod_descriptionn; ?> </small></p>
                                 <textarea id="text-box" cols="10" rows="2" name="content"><?php if(isset($_GET['id'])){echo $edit_post['content'];} ?></textarea>
                              </div>
                           </div>
                        </div>
                       
                        <div class="row">
                           <div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
                              <div class="form-group">
                                 <label class="mb-0"><?= $lang_status ?></label>
                                 <p class="mt-0 mb-1"><small><?= $lang_product_status_text;?></small></p>
                                 <?php if(isset($_GET['id'])){
                                    if ($edit_post['is_published']==0) {
                                    
                                      $checked1 = "checked";
                                    
                                      $checked2 = "";
                                    
                                    }else{
                                    
                                      $checked1 = "";
                                    
                                      $checked2 = "checked";
                                    
                                    }
                                    
                                    }else{
                                    
                                    $checked1 = "checked";
                                    
                                      $checked2 = "";
                                    
                                    } ?>
                                 <div class="radioStyle">
                                    <label class="m-r-25"><input type="radio" name="status" class="m-r-5" <?php echo $checked1; ?> value="0"> <?= $lang_published; ?> </label>
                                    <label><input type="radio" name="status" class="m-r-5" value="1" <?php echo $checked2; ?>> <?= $lang_unpublished; ?>  </label>
                                 </div>
                              </div>
                           </div>
                         </div>
                        <div class="row">
                           <div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
                              <div class="form-group">
                                 <label class="mb-0"><?= $lang_show_to;?></label>
                                 <p class="mt-0 mb-1"><small><?= $lang_show_to_text; ?></small></p>
                                 <select class=" customSelect" name="is_global" class="form-control">
                                    <option value="0" <?php if ($edit_post['is_global']==0) {
                                       echo "selected";
                                       } ?>><?= $lang_show_to_myregions; ?></option>
                                    <option value="2" <?php if ($edit_post['is_global']==2 || !isset($_GET['id'])) {
                                       echo "selected";
                                       } ?>><?= $lang_show_in_larger_radius; ?> </option>
                                       <option value="1" <?php if ($edit_post['is_global']==1) {
                                       echo "selected";
                                       } ?>><?= $lang_show_to_all; ?> </option>
                                 </select>
                              </div>
                           </div>
                         </div>
                        <div class="row">
                           <div class="col-lg-4 co-md-4">
                             <div class="form-group">
                                <label class="mb-0" ><?= $lang_list;?>:</label>
                                <p class="mt-0 mb-1"><small><?= $lang_prod_list_textt;?></small></p>
                                <select name="list" class="form-control customSelect required_field">
                                   <option value="0" <?php if ($edit_post['list']==0) {
                                      echo "selected";
                                      
                                      } ?>><?= $lang_active; ?></option>
                                   <option value="1" <?php if ($edit_post['list']==1) {
                                      echo "selected";
                                      
                                      } ?>><?= $lang_history; ?></option>
                                </select>
                             </div>
                           </div>
                        </div>
                       
                        </div>
                        
                        <div class="btn-showcase d-flex justify-content-end align-items-center">
                           <a class="btn btn-info w-20" href="my_rentals.php"><?= $lang_discard; ?></a>
                           <input class="btn btn-primary w-20" id="add_post" type="submit" name="submit" value="<?= $lang_next_step; ?>"/>
                        </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
      <!-- Container-fluid Ends-->
   </div>
   
</div>
</div>
<?php include("inc/closing_divs.php");?>
<div id="myModal" class="modal fade" role="dialog">
  <div class="modal-dialog">

    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Find Places..</h4>
      </div>
      <div class="modal-body" id="routing_modal_body">
      </div>
    </div>

  </div>
</div>
<?php 
   include("inc/footer.php");
   
    ?>
<script type="text/javascript">
   $(document).ready(function() {
      $("form").on("submit",function(e){
         $("#flash_alert").hide()
         var allow=true;
         $("input.required_field").each(function(){
            if ($(this).val()=="") {
               $(this).attr("style","border:1px solid red !important")
               e.preventDefault();
               allow=false;
               
            }else{
               $(this).attr("style","border:1px solid #4a4a4a !important")
            }
            
         })
            
            if ($("#categories").val()=="" || $("#categories").val()==0) {
               e.preventDefault();
               allow=false;
               $("#categories").next("span").find(".select2-selection").attr("style","border:1px solid red !important");
            }else{
               $("#categories").next("span").find(".select2-selection").attr("style","border:1px solid #4a4a4a !important")
            }
         if (CKEDITOR.instances['text-box'].getData().length<10) {
            e.preventDefault();
            allow=false;
            $("#cke_text-box").attr("style","border:1px solid red !important");
         }else{
            $("#cke_text-box").attr("style","border:1px solid #4a4a4a !important");
         }
         if (($("#price_fiat").val()=="0" && $("#price_minutes").val()=="0") || ($("#price_fiat").val()=="0" && $("#price_minutes").val()=="") || ($("#price_fiat").val()=="" && $("#price_minutes").val()=="0") || ($("#price_fiat").val()=="" && $("#price_minutes").val()=="")) {
            $("#price_fiat").attr("style","border:1px solid red !important");
            $("#price_minutes").attr("style","border:1px solid red !important");
            allow=false;

         }else{
            $("#price_minutes").attr("style","border:1px solid #4a4a4a !important");
         
            $("#price_fiat").attr("style","border:1px solid #4a4a4a !important");
         }
         if (!allow) {
               show_flash("0","<?= $lang_please_fill_all_fields; ?>");
            }
      })

 
   
   const numInputs = document.querySelectorAll('input[type=number]')
   
   
   
   numInputs.forEach(function(input) {
   
   input.addEventListener('change', function(e) {
   
    if (e.target.value == '') {
   
      e.target.value = 0
   
    }
   
   })
   
   })
   
   
   
   });
   

   
   $("#categories").select2({
   
    maximumSelectionLength: 1,
   
   
   });
   
   $("#tags").select2({
   
    maximumSelectionLength: 5
   
   });
   
   
   
   

   $('input[name="price_fiat"]').keyup(function (e) {
   commaOnly($(this));
   });
   
   $('#price_fiat').keyup(function (e) {
   var fiat = parseFloat($(this).val().toString().replace(",","."));
   if (fiat > 200) {
    show_flash("0","<?= $lang_more_than_200_regios; ?>");
    $(this).val("");
   }
   });
   $('#price_minutes').keyup(function (e) {
   var mins = parseInt($(this).val());
   if (mins > 600) {
    show_flash("0","<?= $lang_more_than_600_mins; ?>");
    $(this).val("");
   }
   });
</script>
 <script src="ridesharing/js/spin.min.js"></script>
  <script src="ridesharing/js/leaflet.spin.js"></script>
  <script src="ridesharing/js/leaflet.photon.js"></script>
  <script src="ridesharing/js/foodit.js"></script>
  <script>
    var $startInput = $("#start");
    var $endInput = $("#end");
    var $intermediateInput = $("#intermediate");
    var $optionalInput = $("#optional");

    var $selectMenu = $("#selectMenu");
    var $waypointAddressesInput = $(".waypointAddresses");
    $waypointAddressesInput.click(function (element) {

      var placeholder=$(this).attr("placeholder");
      $("#routing_modal_body").html('<div id="selectMenu" class="form-group"><input type="hidden" class="placeholder_field" placeholder="'+placeholder+'" /><select id="countrySelect" class="form-control"><option value="">Select a country</option><option value="FR">France</option><option value="DE">Germany</option></select><div id="citySelect" class="form-group mt-3"></div><select id="nearbyPlaceSelect" class="form-control mt-3"><option value="">Select nearby city</option></select><select id="suburbSelect" class="form-control mt-3"><option value="">Select a suburb</option></select><select id="streetSelect" class="form-control mt-3"><option value="">Select a Street</option></select><button id="routingAddButton" class="btn btn-success pull-right mt-3" >Add to Routing</button></div>');
      $("#myModal").modal("show");
    });

    $(document).on("click","#routingAddButton",function () {
      if ($(this).closest("#selectMenu").find(".placeholder_field").attr("placeholder") == "Start") {
         alert("start")
        // routingControl.spliceWaypoints(
        //   0,
        //   1,
        //   L.latLng(this.getAttribute("data-lat"), this.getAttribute("data-lng"))
        // );
        startMap({'latlng':[this.getAttribute("data-lat"), this.getAttribute("data-lng")]});
      } else if (
        $(this).closest("#selectMenu").find(".placeholder_field").attr("placeholder") == "End"
      ) {
        // routingControl.spliceWaypoints(
        //   routingControl.getWaypoints().length - 1,
        //   1,
        //   L.latLng(this.getAttribute("data-lat"), this.getAttribute("data-lng"))
        // );
        endMap({'latlng':[this.getAttribute("data-lat"), this.getAttribute("data-lng")]});
      } else if (
        $(this).closest("#selectMenu").find(".placeholder_field").attr("placeholder")==
        "Intermediate"
      ) {
        // routingControl.spliceWaypoints(
        //   routingControl.getWaypoints().length - 1,
        //   0,
        //   L.latLng(this.getAttribute("data-lat"), this.getAttribute("data-lng"))
        // );
        intermediateMap({
          'latlng':[this.getAttribute("data-lat"), this.getAttribute("data-lng")]
        });
      } else if (
        $(this).closest("#selectMenu").find(".placeholder_field").attr("placeholder") == "Optional"
      ) {
        optionalMap({
          latlng: {
            lat: this.getAttribute("data-lat"),
            lng: this.getAttribute("data-lng"),
          },
        });
      }
    });
  </script>
  <script>

       $("#event_repeat").change(function(){

   

   if ($(this).find(":selected").val()=="0") {

   

    $("#repeat_date_text").html("<?= $lang_date; ?>")

   

    $("#repeat_on_div").css({"display":"none"})

   

    $("#repeat_on_sessions").css({"display":"none"})

   

   }else{

   

    $("#repeat_date_text").html("<?= $lang_first_date; ?>") 

   

    $("#repeat_on_div").css({"display":"block"})

   

    $("#repeat_on_sessions").css({"display":"block"})

   

   }

   

   })
  </script>