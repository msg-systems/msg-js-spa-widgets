# uica-widgets
User Interface Component Architecture (UICA) Widgets

## How to use the table widget

### General

If a component should be a table then it is necessary that this component extends from the abstract table widget component:

        extend: app.widget.abstract.table.{ctrl|model|view}

If the table should be able to support single select and/or multi select and/or tree functionality it is necessary to overwrite the specific mehtods. e.g. for single select

       singleSelectPluginOptions () {
            let selectOptions = this.singleSelectDefaultOptions()
            selectOptions.markups = {
                checkedMarkup: this.view.call("jbit7:multiSelectCheckedMarkup"),
                uncheckedMarkup: this.view.call("jbit7:multiSelectUncheckedMarkup")
            }
            return selectOptions
        },

       singleSelectDefaultOptions () {
            return {
                width: 30,
                minWidth: 30,
                cssClass: "{specific CSS-Class}",
                headerCssClass: "{specific CSS-Class}"
            }
        },

For multi select please overwrite the methods `multiSelectPluginOptions` and `multiSelectDefaultOptions` and for the tree functionality the methods `treePluginOptions` and `treeDefaultOptions` have to be overwritten.


### How to initialize the table

#### Options

Setting the options is done in the model. Except the default options of the library [SlickGrid](https://github.com/mleibman/SlickGrid/wiki/Grid-Options/), the following default oprions are set:


<table style="width:100%">
<tbody>
  <tr>
	<th width="30%">Option</th>
	<th width="30%">Default</th>
	<th>Description</th>
  </tr>
<tr>
	<td>rowHeight</td>
	<td>27</td>
	<td>the height of a row, the default option of SlickGrid is 25</td>
  </tr>
<tr>
	<td>enableColumnReorder</td>
	<td>false</td>
	<td>the default option of SlickGrid is true</td>
  </tr>
<tr>
	<td>forceFitColumns</td>
	<td>true</td>
	<td>the default option of SlickGrid is false</td>
  </tr>
<tr>
	<td>activateRowSelectionModel</td>
	<td>true</td>
	<td>activates the possibility to select a row/rows. If it is set to false the table is not selectable at all</td>
  </tr>
<tr>
	<td>selectActiveRow</td>
	<td>true</td>
	<td>If set to true, the selected row/rows will be saved.</td>
  </tr>
<tr>
	<td>activateSelectPlugIn</td>
	<td>true</td>
	<td>if set to true the selection of a row is done through a separate column. If set to false the selection is done by a click  somewhere in the row, does not matter in which column</td>
  </tr>
<tr>
	<td>multiSelect</td>
	<td>false</td>
	<td>it is only possible to select one row at once. If set to true multiple rows can be selected.</td>
  </tr>
</tbody>
</table>

If it is necessary to have different options than the default, they can be overwritten in the method `initializeOptions` in the model, e.g.

		initializeOptions () {
            this.base()
            this.options.multiSelect = true
            this.options.editable = true
			this.options.rowHeight = 36
        }

#### Columns

To define which columns should exist for the table, it is necessary to implement the method `initializeColumns`. The method must set the dynamics `columns`, it must be an array of column object. A column object hast the following mandatory and optional fields (see also [SlickGrid Column-Options](https://github.com/mleibman/SlickGrid/wiki/Column-Options)):

<table style="width:100%">
<tbody>
  <tr>
	<th width="30%">Option</th>
	<th>Description</th>
  </tr>
<tr>
	<td>field</td>
	<td>mandatory: the name of the attribute, which value of the data object should be representated in this column</td>
  </tr>
<tr>
	<td>id</td>
	<td>mandatory: the unique id of a column, normally this should be the same as id</td>
  </tr>
<tr>
	<td>formatter</td>
	<td>optional: a function that returns the value to be written in the cell, can be a simple string or a HTML string.</td>
  </tr>
<tr>
	<td>useFormatterForSearch</td>
	<td>optional: Boolean flag, if the formatted value or the unformatted data value should be used for the search, e.g. a date's data value are milliseconds 1487890800000 and the formatted value therefore is 24.02.17</td>
  </tr>
<tr>
	<td>useFormatterForSort</td>
	<td>optional: Boolean flag, if the formatted value or the unformatted data value should be used for the sort. Same mechanism as useFormatterForSearch</td>
  </tr>
</tbody>
</table>

An example for the method `initializeColumns`:

	initializeColumns () {
            let columns = [
                {id: "type", cssClass: "centerText",  headerCssClass: "centerText", maxWidth: 200, 
					formatter: app.util.format.slickColumnFormatter.typeFormatter},
                {id: "origin", cssClass: "centerText",  headerCssClass: "centerText", maxWidth: 200},
                {id: "description", cssClass: "centerText",  headerCssClass: "centerText"}
            ]

            this.columns = _.map(columns, each => {
                each.field = each.field || each.id
                each.name = each.name || i18next.t(`___config.id___.column.${each.id}`)
                each.toolTip = each.toolTip || i18next.t(`___config.id___.tooltip.${each.id}`)
                each.sortable = each.hasOwnProperty('sortable') ? each.sortable : true
                each.useFormatterForSearch = each.hasOwnProperty('useFormatterForSearch') ? each.useFormatterForSearch: true
                each.useFormatterForSort = each.hasOwnProperty('useFormatterForSort') ? each.useFormatterForSort: true
                return each
            })
        }

#### Data Table Entries

Setting the data is done in the controller.
In the observer of the data it is necessary to call teh method `updatePresentationTableEntries`, e.g.:

      this.observeParentModel("global:data:orders", (ev, orders, oldOrders) => {
      		this.updatePresentationTableEntries(orders, oldOrders)
      }, {boot: true})

The method `updatePresentationTableEntries` generates presentation objects out of the given data objects, that will be given to the table.

If it is necessary that the presentation object has more or different attributes then the data object, it is possible to add or overwrite attributes in the method `addPresentationAttributesToItemFromEntity`, e.g.

		addPresentationAttributesToItemFromEntity (item, entity) {
            item.lossType = app.util.format.DisplayFormatter.lossTypeFormatter(entity)
            item.workorderState = entity.workOrder && entity.workOrder.postBoxState ? entity.workOrder.postBoxState.text : ""
        }

This method is internal called for each object of the array (in this example the array this.model.value("global:data:orders")) whereby the parameter `item` the generated presentation object is and `entity` the original data object.
But it is not allowed to overwrite the attribute `id` in this method. Use the method `presentationIdOfEntity` instead.

The table needs a unique id, this is generated internal, by default the attribute `id` of the data object is used. If another id is needed, if the unique identifier of the data object is no the attribute id or even more than one attributes it is possible to overwrite the method `presentationIdOfEntity (entity)`. This method needs to return the value of the unique identifier of the given data object (parameter entity).

		presentationIdOfEntity (entity) {
            return entity.orderId + entity.anotherAttribute
        }


#### TreeTable

For tree tables thie method `generatePresentationTableEntries` must be overwritten. To generate one table tree item call `generatePresentationTreeEntry(entity, pParent, isLeaf, defaultCollapsed)`. If more attributes are needed for the tree table presentation object it is handle like with flat tables, the attributes needs to be added or overwritten for each table presentation object (item) in the method `addPresentationAttributesToItemFromEntity`.


### Filter table entries

If there is a modelfield that holds the filter value, you can observe this modelfield and then call the method `filterTableEntries` with the filter value as parameter, e.g.

			this.observeParentModel("global:data:filterValue", (ev, value) => {
                this.filterTableEntries(value)
            }, {boot: true})


### Sort table entries

It is possible to set the inital sort object. Normally this has to be done in the lifecycle `create` like this:
		
		    this.model.value("data:sortObject", {field: "{attribute of the presentation object}", asc: 1})

Sorting only possible if the <a href='#options'>Grid Option</a> *sortable* is set to true.



### Add, delete or update of a data object

The table were given presentation objects of data objects. It is possible that the array of data objects changes. Now the presentation objects or rather the table entries needs to be synchronized. Therefore the following needs to be done.

#### Add a new data object

The method `addEntities(entities)` can be called to add one or more entities (the parameter entities can be one single data object or an array o data objects).

Additional the method `onItemAdded(args)` must be overwritten. There the modelfield that holds the data objects must be updated. 

		// args = {item: tableEntry, index: index}
		onItemAdded(args) {
            let addedEntity = args.item.entity
            this.model.value('global:data:orders').push(addedEntity)
        }


#### Delete an existing data object

The method `addEntities(entities)` can be called to delete one or more entities (the parameter entities can be one single data object or an array o data objects).

Additional the method `onItemDeleted(args)` must be overwritten. There the modelfield that holds the data objects must be updated. 

		// args = {item: tableEntry}
		onItemDeleted(args) {
            let deletedEntity = args.item.entity
            _.remove(this.model.value('global:data:orders'), deletedEntity)
        }

#### Update a data object

The method `updateEntities(entities)` can be called to update one or more entities (the parameter entities can be one single data object or an array o data objects).

Additional the method `onItemUpdated(args)` ( args = {item: tableEntry, index: index} ) has to be overwritten if necessary. It is possible that this is not necessary when the references of the updated entitites was change before and due this change the update of the presentation objects was triggered. 