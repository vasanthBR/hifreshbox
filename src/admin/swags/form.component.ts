import { Component, OnInit, Injectable } from '@angular/core';
import { Router, Resolve, ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { ProductsService, AlertService } from "services";
import { FormBuilder, Validators, FormArray } from "@angular/forms";

@Injectable()
export class swagEditResolve implements Resolve<any> {
  
  constructor(private swagsService: ProductsService) {}
  
  resolve(route: ActivatedRouteSnapshot) {
    let swagSku = route.params['sku'];
    return this.swagsService.getProduct(swagSku);
  }
}

export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function checkAllChildrenValid (c: FormArray): { [key: string] : any} {
    if (c.controls.length == 0) {
        return {
            checkAllChildrenValid: true
        };
    }

    for (let i: number = 0; i < c.controls.length-1; i++) {
        if (!c.controls[i].valid) {
            return {
                checkAllChildrenValid: true
            };
        }
    }

    return {
        checkAllChildrenValid: false
    };
}

@Component({
    templateUrl: 'form.component.html'
})
export class SwagFormComponent implements OnInit {
    private swag:any;
    private swagForm:any;
    private customAttributes:any;
    private ingredientsOptions:any;
    private ingredients:any;
    private newIngredient:any;
    private swagSteps:any;
    private newSwagStep:any;
    private submitted:any;
    private image:any;

    constructor(
      private swagsService: ProductsService,
      private alert: AlertService,
      private route: ActivatedRoute,
      private router: Router,
      private _fb : FormBuilder
    ) { }
    
    ngOnInit(): void {
      this.ingredients = [];
      this.newIngredient = {};
      this.swagSteps = [];
      this.ingredientsOptions = null;
      this.image = {};

      this.swagsService.getIngredienOptions().subscribe(data => {
        this.ingredientsOptions = {};
        let options = data[0];
        this.ingredientsOptions.ingredients = options.ingredients.map(ingredient => {
          return {id: ingredient.ingredient_id, text: ingredient.title}
        });
        this.ingredientsOptions.portions = options.portions.map(portion => {
          return {id: portion.portion_id, text: portion.title}
        });
      });;

      let swagSku = this.route.snapshot.params['sku'];
      this.swag = (swagSku)?this.route.snapshot.data['swag']:{};

      this.customAttributes = [];
      let customAttributesArray = [];
      ["description", "order_shipping", "return_policy"].map(attribute_code => {
        let value = '';
        if(this.swag && this.swag.custom_attributes) {
          let attribute = this.swag.custom_attributes.find(x => x.attribute_code == attribute_code);
          value = attribute?attribute.value:'';
        };
        this.customAttributes.push(attribute_code);
        customAttributesArray.push(this.addCustomArrtibute(attribute_code, value, true));
      });
      customAttributesArray.push(this.addCustomArrtibute("category_ids", ['41'], false));
      
      this.swagForm = this._fb.group({
        name : [this.swag.name, [Validators.required, Validators.minLength(5)]],
        visibility: 1,
        type_id : 'simple',
        price : 0,
        status : 1,
        attribute_set_id : 16,
        extension_attributes : this._fb.group({
          stock_item : this._fb.group({
            manage_stock : 0,
            is_in_stock : 1,
            qty : 0
          })
        }),
        custom_attributes : this._fb.array(customAttributesArray)     
      });
    }

    addCustomArrtibute(attribute_code, value, required) {
      if(attribute_code == "category_ids") {
        value = this._fb.array(value);
      }
      if(required) {
        value = [value, Validators.required];
      }
         
      return this._fb.group({
        attribute_code : attribute_code,
        value : value
      });      
    }

    getCustomAttributeIndex(attribute_code) {
      return this.customAttributes.indexOf(attribute_code);
    }

    getCustomAttributeValue(attribute_code) {
      let index = this.getCustomAttributeIndex(attribute_code);
      if(index >= 0) {
        let controls = this.swagForm.controls['custom_attributes'].controls;
        return controls[index].get('value').value;
      }
      return '';
    }

    ingredientDisable() {
      return !(this.newIngredient.ingredient && this.newIngredient.qty);
    }

    refreshIngredientOptionValue(ingredient) {
      this.newIngredient.ingredient = ingredient;
    }

    addIngredient() {
      this.ingredients.push(this.newIngredient);
      this.newIngredient = {};
    }

    removeIngredient(i: number) {
      this.ingredients.splice(i, 1);      
    }

    addSwagStep() {
      this.swagSteps.push(this.newSwagStep);
      this.newSwagStep = "";
    }

    removeSwagStep(i: number) {
      this.swagSteps.splice(i, 1);
    }

    setInputErrorClass(input) {
      let invalid = this.swagForm.get(input).invalid && this.submitted;
      if(invalid) return 'form-control-danger';
    }

    setContainerErrorClass(input) {
      let invalid = this.swagForm.get(input).invalid && this.submitted;
      if(invalid) return 'has-danger';
    }

    setAttrInputErrorClass(attribute_code) {
      let index = this.getCustomAttributeIndex(attribute_code);
      let invalid = false;
      if(index >= 0) {
        invalid = this.swagForm.controls['custom_attributes'].controls[index].invalid && this.submitted;
      }
      if(invalid) return 'form-control-danger';
    }

    setAttrContainerErrorClass(attribute_code) {
        let index = this.getCustomAttributeIndex(attribute_code);
        let invalid = false;
        if(index >= 0) {
          invalid = this.swagForm.controls['custom_attributes'].controls[index].invalid && this.submitted;
        }
        if(invalid) return 'has-danger';
    }

    changeListener($event) : void {
      this.readThis($event.target);
    }

    readThis(inputValue: any): void {
      var file:File = inputValue.files[0];
      var myReader:FileReader = new FileReader();

      this.image.filetype = file.type;
      this.image.filename = file.name;
      this.image.filesize = file.size;

      myReader.onloadend = (e) => {
        this.image.base64 = myReader.result;
        console.log(this.image);
      }
      myReader.readAsDataURL(file);
    }

    saveSwag() {
      this.alert.clear();
      this.submitted = true;
      if (this.swagForm.dirty && this.swagForm.valid) {
          let swagSku = this.route.snapshot.params['sku'];
          
          let sendData = this.swagForm.value;
          sendData.custom_attributes.push({
            attribute_code : "ingredients",
            value : JSON.stringify(this.ingredients)
          });
          sendData.custom_attributes.push({
            attribute_code : "steps",
            value : JSON.stringify(this.swagSteps)
          });
          if(!swagSku) {
            swagSku = '';
            sendData.sku = getRandomInt(10000, 99999);
          }

          this.swagsService.saveProduct(swagSku, {product : sendData}).subscribe(
              data => {
                if(this.image.base64) {
                  let base64 = this.image.base64.split('base64,');
                  let image_upload = {
                    media_type: 'image',
                    label: 'Product Image',
                    position: 0,
                    disabled: 0,
                    types: ['image','small_image','thumbnail','swatch_image'],
                    file: this.image.filename,
                    content: {
                      base64_encoded_data: base64[1],
                      type: this.image.filetype,
                      name: this.image.filename
                    }                    
                  };
                  this.swagsService.saveProductImage(data.sku, image_upload).subscribe(
                    data => {
                      this.alert.success("The swag details are saved successfully!", true);
                      this.router.navigate(['swags']);
                    }
                  );
                } else {
                  this.alert.success("The swag details are saved successfully!", true);
                  this.router.navigate(['swags']);
                }                   
              },
              error => {
                  if(error.status == 401) {
                      this.alert.error("Access restricted!");
                  } else {
                      this.alert.error("Server Error");
                  }
                  window.scrollTo(0,0);
              }
          );
      } else {
        this.alert.error("Please check the form to enter all required details");
        window.scrollTo(0,0);
      }
    }

    goToList() {
      this.router.navigate(['swags']);
    }
}