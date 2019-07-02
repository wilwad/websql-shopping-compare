/*
 * WebSQL Shopping Compare app
 * William Sengdara @ June - July 2019
 *
 * Data is generic unless toString() or parseInt() are used to force them to specific
 *
 * Use parseInt(data) when dealing with numbers to ensure you are inserting numbers. 
 * Otherwise selects don't work when using number comparisons. 
 * Of course sorting ASC/DESC works differently for strings and numbers
*/
class Schema {
	/* init */
	constructor(){
		this.db = openDatabase('shopping.compare', '1.0', 'Shopping Helper', 2 * 1024 * 1024);
		
		if (! this.db){
			alert('Failed to open/create the database. Cannot continue.')
			
		} else {
			
			// create the tables
			this.db.transaction(function (tx) {
			  tx.executeSql('CREATE TABLE IF NOT EXISTS stores(name unique)');
			  tx.executeSql('CREATE TABLE IF NOT EXISTS items(name unique)');
			  tx.executeSql('CREATE TABLE IF NOT EXISTS cart(store_id, item_id, price)');
			});
			
			console.log('WebSQL db version:', this.db.version)		
		}		
	}
	
	// this returns raw access to db
	// use this during data import / export
	rawdb = function () {
		return this.db;
	}
		
	// Add an item to table stores, items only
	add = function (table, name, cbSuccess, cbFail) {
		
			if (! this.db){
				cbFail("DB == null");
				return false;
			}
			
			// cleanup
			name = name.trim()
			
			// existing?
			this.db.transaction(function (tx) {
				
			  tx.executeSql(`SELECT * FROM ${table} WHERE name=?`, [name], function(tx, results){
			  		// already exists
					if ( results.rows.length){
						cbFail("Item already exists.");
						return false;
					}
					
					// add it
					tx.executeSql(`INSERT INTO ${table} (name) VALUES (?)`, [name], function(tx, results){
						cbSuccess();
					});
					
				});
			});
	}
	
	// edit an item in table stores, items only
	edit = function (table, rowid, name, cbSuccess, cbFail) {
			if (! this.db){
				cbFail("DB == null")
				return false;
			}
					
			// cleanup
			name = name.trim()
			
			// existing?
			this.db.transaction(function (tx) {
			  tx.executeSql(`SELECT * FROM ${table} WHERE rowid=?`, [rowid], function(tx, results){
					if (! results.rows.length){
						cbFail("Item does not exist.")
						return false;
					}

					tx.executeSql(`UPDATE ${table} SET name=? WHERE rowid=?`, [name, rowid], function(tx, results){
						cbSuccess()
					});
					
				});
			});
	}
	
	// return item from stores, items where rowid = rowId
	getItemById = function (table, rowId, cbSuccess, cbFail) {
			if (! this.db){
				cbFail("DB == null")
				return false;
			}
					
			this.db.transaction(function (tx) {
			  tx.executeSql(`SELECT * FROM ${table} WHERE rowid=? LIMIT 1`, [rowId], function(tx, results){
					if (! results.rows.length){
						cbfail("Item does not exist.")
						return false;
					}
					let ret = {rowid: rowId, name: results.rows[0].name}
					
					cbSuccess( ret )
				});
			});		
	}
	
	// get id of item from stores, items named
	getItemId = function (table, named, cbSuccess, cbFail) {
			if (! this.db){
				cbFail("DB == null")
				return false;
			}
					
			this.db.transaction(function (tx) {
				// cleanup
				named = named.trim()
				
			  tx.executeSql(`SELECT rowid FROM ${table} WHERE name=? LIMIT 1`, [named], function(tx, results){
					if (! results.rows.length){
						cbfail("Item does not exist.")
						return false;
					}
					
					let ret = {rowid: results.rows[0].rowid, name: named}
					cbSuccess( ret )
				});
			});		
	}
	// delete an item from stores, items matching rowId
	remove = function (table, rowId, cbSuccess, cbFail) {
			if (! this.db){
				cbFail("DB == null")
				return false;
			}
					
			// existing?
			this.db.transaction(function (tx) {
			  tx.executeSql(`SELECT * FROM ${table} WHERE rowid=?`, [rowId], function(tx, results){
					if (! results.rows.length){
						cbFail("Item not found")
						return false;
					}
					
					// removing from cart when removing a store or item
					var field = table == 'stores' ? 'store_id' : 'item_id';

					tx.executeSql(`DELETE FROM cart WHERE ${field}=?`, [rowId], function(tx, results){
						console.log(results.rows)
						tx.executeSql(`DELETE FROM ${table} WHERE rowid=?`, [rowId], function(tx, results){
							cbSuccess()
						});						
					});

				});
			});
	}	
	
	// return a list of items from stores or items
	list = function (table, cbSuccess, cbFail) {
			if (! this.db){
				cbFail('db == null')
				return false;
			}
					
			// existing?
			this.db.transaction(function (tx) {
				let sql = `SELECT rowid, name FROM ${table} ORDER BY name ASC`
				
			  tx.executeSql(sql, [], function(tx, results){
					if (! results.rows.length){
						cbFail('results.rows == 0')
						return false;
					}

					let rows = results.rows
					var rows_ = {};	
					
					for(let r in rows){
						if (rows[r].rowid){
							rows_[r] = {rowid: rows[r].rowid, name: rows[r].name}
						}
					}
					
					cbSuccess( rows_ )
				});
			});
	}	
	
	//********** carting ************
	
	// add an item to the cart
	cartAdd = function (storeId, itemId, price, cbSuccess, cbFail) {
			if (! this.db){
				cbFail("DB == null")
				return false;
			}
			
			let table = 'cart';
							
			storeId = parseInt(storeId)
			itemId = parseInt(itemId)							
			price = parseFloat(price)
				
			// Should not exist
			this.db.transaction(function (tx) {
			  var sql = `SELECT store_id, item_id 
			  					  FROM ${table} 
			  					  WHERE store_id=? AND item_id=?`;
			  					  			
			  tx.executeSql(sql, [storeId, itemId], function(tx, results){
					if (results.rows.length){
						cbFail('Already exists')
						return false;
					}

					tx.executeSql(`INSERT INTO ${table} (store_id, item_id, price) VALUES (?, ?, ?)`, [storeId, itemId, price], function(tx, results){
						cbSuccess()
					});
					
				});
			});			
	}
	
	// alter the store and cost of an item in the cart
	cartEdit = function(rowId, storeId, itemId, price, cbSuccess, cbFail){
			if (! this.db){
				cbFail("DB == null")
				return false;
			}
			
			let table = 'cart';

			storeId = parseInt(storeId)
			price = parseFloat(price)
			
			// Must exist
			this.db.transaction(function (tx) {
				// our new data must not exist
				var sql = `SELECT * 
								FROM ${table} 
								WHERE (store_id=? AND 
										item_id=?) AND 
										rowid<>?`;
				
			   tx.executeSql(sql, [storeId,itemId, rowId ], function(tx, results){
			   	if (results.rows.length){
			   		cbFail("An entry exists for that item & price at that store")
			   		return false;
			   	}
			   	
				  tx.executeSql(`SELECT rowid 
				  					  FROM ${table}  
				  					  WHERE rowid=? 
				  					  LIMIT 1`, [rowId], function(tx, results){
						if (! results.rows.length){
							cbFail(`Item #${rowid} does not exist`)
							return false;
						}
	
						tx.executeSql(`UPDATE ${table} 
											SET store_id=?, price=? 
											WHERE rowid=?`, [storeId, price, rowId], function (tx, results) {
							console.log('rows affected:', results.rows.length)
							cbSuccess()		
							return true;					
						});
	
					});	
							   	
			   })
			});
	}
	
	// remove an item entry from the cart
	cartRemove = function(rowId, cbSuccess, cbFail){
			if (! this.db){
				cbFail('DB is null')
				return false;
			}
			
			let table = 'cart';
								
			// Must exist
			this.db.transaction(function (tx) {
			  
			  tx.executeSql(`SELECT rowid FROM ${table} WHERE rowid=? LIMIT 1`, [rowId], function(tx, results){
					if (! results.rows.length){
						cbFail(`Item ${rowid} does not exist`)
						return false;
					}

					tx.executeSql(`DELETE FROM ${table} WHERE rowid=?`, [rowId], function (tx, results) {
							console.log(`Deleted ${rowId}`)
							cbSuccess()
							return true;
					});					
					
				});
			});
	}	
	
	// return cost of an item at multiple stores
	cartItemPrices = function(itemId, cbSuccess, cbFail){
			if (! this.db){
				cbFail("DB == null")
				return false;
			}
			
			let table = 'cart';
								
			// Must exist
			this.db.transaction(function (tx) {
				let sql = `SELECT 
										c.rowid AS rowid,
										i.rowid AS itemid, 
										i.name AS item, 
										s.rowid AS storeid,
										s.name AS store,										
										c.price 
								FROM cart c,
									  stores s, 
									  items i									
								WHERE 
										c.store_id = s.rowid AND 
								      c.item_id = i.rowid AND
								      i.rowid = ?
								ORDER BY c.price ASC`

			  tx.executeSql(sql, [itemId], function(tx, results){
			  	
					if (! results.rows.length){
						cbFail("results.rows.length == 0")
						return false;
					}

					let rows = results.rows
					var rows_ = {};	
					
					for(let r in rows){
						if (rows[r].rowid){
							rows_[r] = {rowid:   rows[r].rowid, 
											item:    rows[r].item,
											itemid:  rows[r].itemid,
											store:   rows[r].store,
											storeid: rows[r].storeid,
											price: 	parseFloat(rows[r].price)										
											}
						}
					}
					cbSuccess(rows_)
				});
			});
	}

	// get props for item in cart
	cartItemById = function(itemId, cbSuccess, cbFail){
			if (! this.db){
				cbFail('DB == null')
				return false;
			}
			
			// Must exist
			this.db.transaction(function (tx) {
				let sql = `SELECT 
										c.rowid AS rowid,
										i.rowid AS itemid, 
										i.name AS item, 
										s.rowid AS storeid,
										s.name AS store,										
										c.price 
								FROM cart c,
									  stores s, 
									  items i									
								WHERE 
										c.store_id = s.rowid AND 
								      c.item_id = i.rowid AND
								      c.rowid = ?
								LIMIT 1`

			  tx.executeSql(sql, [itemId], function(tx, results){

					if (! results.rows.length){
						cbFail('Item not found.')
						return false;
					}

					let rows = results.rows
					var row = {rowid:   rows[0].rowid, 
								  item:    rows[0].item,
								  itemid:  rows[0].itemid,
								  store:   rows[0].store,
								  storeid: rows[0].storeid,
								  price:   rows[0].price										
								}

					cbSuccess( row )
				});
			});
	}

	// empty the cart
	cartClear = function(cbSuccess, cbFail){
			if (! this.db){
				cbFail("DB == null")
				return false;
			}
			
			this.db.transaction(function (tx) {

			  tx.executeSql("DELETE FROM cart", [], function(tx, results){
					cbSuccess()
				});
			});
		}
				
	// get list of cart items
	cartItems = function(cbSuccess, cbFail){
			if (! this.db){
				cbFail("DB == null")
				return false;
			}
			
			let table = 'cart';
								
			// Must exist
			this.db.transaction(function (tx) {
				let sql = `SELECT DISTINCT
										i.name AS item,
										i.rowid AS itemid,
										c.rowid AS rowid,
										(SELECT COUNT(s.name)
											FROM cart c2,
												  stores s, 
												  items i2									
											WHERE 
													c2.store_id = s.rowid AND 
											      c2.item_id = i2.rowid AND
											      i2.rowid = i.rowid
											ORDER BY c2.price ASC) AS stores
								FROM cart c,
									  items i									
								WHERE 
										c.item_id = i.rowid
								GROUP BY i.name
								ORDER BY i.name ASC`

			  tx.executeSql(sql, [], function(tx, results){
			  	
					if (! results.rows.length){
						cbFail('zero rows')
						return false;
					}

					let rows = results.rows
					var rows_ = {};	

					for(let r in rows){
						if (rows[r].rowid !== undefined){
							rows_[r] = { rowid:   rows[r].rowid, 
											 item:    rows[r].item,
											 itemid:  rows[r].itemid,
					                   stores:  rows[r].stores								
											}
						}
					}

					cbSuccess(rows_)
				});
			});
	}
	
	/*
	 * Export this
	 * var data = {}
	 
		g_db.dataExport((s, i, c)=>{
			console.log('Stores',s)
			console.log('Items', i)
			console.log('Cart',c)
			
			data = {}			
			data.stores = s;
			data.items = i;
			data.cart = c;

			let j = JSON.stringify(data)
			console.log(j)
		}, 
		(err)=>{
			console.log(err)
		})
	 
	*/
	dataExport = function (cbSuccess, cbFail) {
			if (! this.db){
				cbFail("DB == null")
				return false;
			}
			
			var tables = ['stores', 'items', 'cart'];
			var rowsStores = [];
			var rowsItems = [];
			var rowsCart = [];
			
			this.db.transaction(function (tx) {
						for(let idx=0; idx < tables.length; idx++){
							 let table = tables[idx];
							 let sql = `SELECT rowid,* FROM ${table}`;	
						 
							 tx.executeSql(sql, [], function(tx, results){
			
								if (! results.rows.length){
									console.log(`Empty table: ${table}`)
			
								} else {
			                        let rows = results.rows;
			
			                        console.log(`${table} records: ${rows.length}`)
			
			                        for(let idy=0; idy < rows.length; idy++){
			                        	let row = rows[idy]
			                        	
			                            switch (table){
			                                case 'stores':
															rowsStores.push({rowid: parseInt(row.rowid), 
															                 name: row.name})
															break;
						
			                                case 'items':
			                                    rowsItems.push({rowid: parseInt(row.rowid), 
			                                                    name: row.name})
			                                    break;
			
			                                case 'cart':
			                                    rowsCart.push({rowid: parseInt(row.rowid), 
			                                                   store_id: parseInt(row.store_id), 
			                                                   item_id: parseInt(row.item_id), 
			                                                   price: parseFloat(row.price)})
			                                    break;
			                            }
			                        }
			                        

								}
								
								if (idx+1 == tables.length){
									// Nested callbacks are a friggin nightmare!
									cbSuccess(rowsStores, rowsItems, rowsCart)
								}								
								
							});
			        }
			});			
	}
			
	// clear the table specified by table
	clearTable = function (table, cbSuccess, cbFail) {
			if (! this.db){
				cbFail("DB == null")
				return false;
			}
			
			this.db.transaction(function (tx) {
			  let sql = `DELETE FROM ${table}`
			  
			  tx.executeSql(sql, [], function(tx, results){
					cbSuccess(results.rows.length)
				});
			});		
	}
	
	// return items and stores in the cart
	cartList = function(cbSuccess, cbFail){
			if (! this.db){
				cbFail("DB == null")
				return false;
			}
			
			let table = 'cart';
								
			// Must exist
			this.db.transaction(function (tx) {
				
				let sql = `SELECT 
										c.rowid AS rowid,
										i.rowid AS itemid, 
										i.name AS item, 
										s.rowid AS storeid,
										s.name AS store,										
										c.price 
								FROM cart c,
									  stores s, 
									  items i									
								WHERE c.store_id = s.rowid AND 
								      c.item_id = i.rowid
								ORDER BY i.name ASC`
					  
			  tx.executeSql(sql, [], function(tx, results){
			  	
					if (! results.rows.length){
						cbFail('zero rows')
						return false;
					}

					let rows = results.rows
					var rows_ = {};	

					for(let r in rows){
						if (rows[r].rowid !== undefined){
							rows_[r] = {rowid:   rows[r].rowid, 
											item:    rows[r].item,
											itemid:  rows[r].itemid,
											store:   rows[r].store,
											storeid: rows[r].storeid,
											price: 	rows[r].price										
											}
						}
					}

					cbSuccess(rows_)
				});
			});
	}	
}