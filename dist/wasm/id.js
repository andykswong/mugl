let _Symbol$iterator,_Symbol$iterator2;const MAX_SAFE_GENERATION=(1<<21)-1;const UNIT_GENERATION=2**32;export function id(index,generation){return(generation&MAX_SAFE_GENERATION)*UNIT_GENERATION+(index>>>0)}export function indexOf(id){return id>>>0}export function generationOf(id){return id/UNIT_GENERATION&MAX_SAFE_GENERATION}_Symbol$iterator=Symbol.iterator;export class IdAllocator{constructor(){this.generations=[];this.freeList=[]}[_Symbol$iterator](){return this.values()}get size(){return this.generations.length-this.freeList.length}clear(){this.generations.length=0;this.freeList.length=0}create(){let index;let generation;if(this.freeList.length>0){index=this.freeList.pop();generation=Math.abs(this.generations[index]);this.generations[index]=generation}else{index=this.generations.length;generation=index?0:1;this.generations.push(generation)}return id(index,generation)}delete(id){if(!this.has(id)){return false}const index=indexOf(id);let generation=-(this.generations[index]+1&MAX_SAFE_GENERATION);if(!index&&!generation){++generation}this.generations[index]=generation;this.freeList.push(index);return true}forEach(callbackFn,thisArg){let index=0;for(const id of this.values()){callbackFn.call(thisArg,id,index,this);index+=1}}has(id){return indexOf(id)<this.generations.length&&generationOf(id)===this.generations[indexOf(id)]}*values(){for(let i=0;i<this.generations.length;++i){const generation=this.generations[i];if(this.generations[i]>=0){yield id(i,generation)}}}}_Symbol$iterator2=Symbol.iterator;export class IdArena{constructor(){this.allocator=new IdAllocator;this.data=[]}[_Symbol$iterator2](){return this.entries()}add(value){const id=this.allocator.create();this.data[indexOf(id)]=value;return id}clear(){this.allocator.clear();this.data.length=0}delete(id){if(this.allocator.delete(id)){delete this.data[indexOf(id)];return true}return false}*entries(){for(const id of this.allocator.values()){yield[id,this.data[indexOf(id)]]}}forEach(callbackFn,thisArg){this.allocator.forEach(id=>{callbackFn.call(thisArg,this.data[indexOf(id)],id,this)},thisArg)}get(id){return this.has(id)?this.data[indexOf(id)]:undefined}has(id){return this.allocator.has(id)}keys(){return this.allocator.values()}*values(){for(const id of this.allocator.values()){yield this.data[indexOf(id)]}}}
//# sourceMappingURL=id.js.map