import { Role } from "../../../security/shared/role.model";
import { User } from "../../../security/shared/user.model";
import { RolePermissionMap } from "../../../security/shared/role-permission-map.model";
import { UserRoleMap } from "../../../security/shared/user-role-map.model";
import { Injectable, Directive } from '@angular/core';
import { ItemCategoryModel } from "../shared/item-category.model";
import { ItemCategoryDLService } from '../shared/item-category.dl.service'

import * as moment from 'moment/moment';
import * as _ from 'lodash';
@Injectable()
export class ItemCategoryBLService {

    constructor(public itemcategoryDLService: ItemCategoryDLService) {
    }

    //Get
    public GetItemCategoryList() {
        return this.itemcategoryDLService.GetItemCategoryList()
            .map(res => { return res });
    }
    public GetItemCategory() {
        return this.itemcategoryDLService.GetItemCategory()
            .map(res => { return res });
    }
  

    //Post
    public AddItemCategory(CurrentItemCategory: ItemCategoryModel) {
        //omiting the appointmentvalidator during post because it causes cyclic error during serialization in server side.
        var temp = _.omit(CurrentItemCategory, ['ItemCategoryValidator']);
        return this.itemcategoryDLService.PostItemCategory(temp)
            .map(res => { return res });
    }

    //Put

    public UpdateItemCategory(itemcategory: ItemCategoryModel) {
        //to fix serializaiton problem in server side
        if (itemcategory.CreatedOn)
            itemcategory.CreatedOn = moment(itemcategory.CreatedOn).format('YYYY-MM-DD HH:mm');

        var temp = _.omit(itemcategory, ['ItemCategoryValidator']);
        return this.itemcategoryDLService.PutItemCategory(temp)
            .map(res => { return res });
    }

}