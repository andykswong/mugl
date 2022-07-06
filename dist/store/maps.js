let _Symbol$iterator,_Symbol$iterator2;import{indexOf}from"./id.js";_Symbol$iterator=Symbol.iterator;export class GenIdMap{constructor(){this.map=new Map}get size(){return this.map.size}clear(){this.map.clear()}delete(id){const entry=this.map.get(indexOf(id));if(entry&&entry[0]===id){this.map.delete(indexOf(id));return true}return false}entries(){return this.map.values()}forEach(callbackFn,thisArg){this.map.forEach(entry=>{callbackFn.call(thisArg,entry[1],entry[0],this)})}get(id){const entry=this.map.get(indexOf(id));if(entry&&entry[0]===id){return entry[1]}return undefined}has(id){const entry=this.map.get(indexOf(id));return!!entry&&entry[0]===id}*keys(){for(const entry of this.map.values()){yield entry[0]}}set(id,value){this.map.set(indexOf(id),[id,value]);return this}*values(){for(const entry of this.map.values()){yield entry[1]}}[_Symbol$iterator](){return this.entries()}}_Symbol$iterator2=Symbol.iterator;export class SparseSetMap{constructor(){this.sparse=[];this.ids=[];this.dense=[]}get size(){return this.dense.length}clear(){this.sparse.length=0;this.ids.length=0;this.dense.length=0}delete(id){if(this.has(id)){const index=indexOf(id);const denseIndex=this.sparse[index];this.sparse[indexOf(this.ids[this.size-1])]=denseIndex;this.ids[denseIndex]=this.ids[this.size-1];this.dense[denseIndex]=this.dense[this.size-1];this.sparse[index]=-1;this.ids.pop();this.dense.pop();return true}return false}*entries(){for(let i=0;i<this.ids.length;++i){yield[this.ids[i],this.dense[i]]}}forEach(callbackFn,thisArg){this.ids.forEach((id,i)=>{callbackFn.call(thisArg,this.dense[i],id,this)})}get(id){return this.has(id)?this.dense[this.sparse[indexOf(id)]]:undefined}has(id){return this.ids[this.sparse[indexOf(id)]]===id}*keys(){for(let i=0;i<this.ids.length;++i){yield this.ids[i]}}set(id,value){const denseIndex=this.sparse[indexOf(id)];if(!isNaN(denseIndex)&&denseIndex>=0){this.ids[denseIndex]=id;this.dense[denseIndex]=value}else{this.sparse[indexOf(id)]=this.ids.length;this.ids.push(id);this.dense.push(value)}return this}*values(){for(let i=0;i<this.ids.length;++i){yield this.dense[i]}}[_Symbol$iterator2](){return this.entries()}}
//# sourceMappingURL=maps.js.map