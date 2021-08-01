
import loader from '@assemblyscript/loader';
import { muglBind } from 'mugl';

export function loadExamplesWASM(): Promise<any> {
  const imports = {};
  const bind = muglBind(imports);

  return loader.instantiate(
    fetch('examples.wasm'),
    imports
  ).then(({ exports }) => {
    bind.bindModule(exports);
    console.log(bind);
    return exports;
  });
}
