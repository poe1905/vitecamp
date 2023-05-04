interface natural_type {
  product_id: string; //目标物品
  construction_quantity: number; //建筑数量
  recipe_id: string; // 配方id
  spraying_quantity: string; //喷涂数量
  stimulation_model: string; //增产模式

  facility_id: string; //设施id
  building: string; // 建筑物
  multiple: string; // 倍率
  time: number; //时间
}
interface needs_list_type {
  needs_list: [key: string][]; // 目标产线内容
  natural_production_line: natural_type[]; // 固有产线列表
  // [0号产线{"目标物品","建筑数量","配方id","喷涂点数","增产模式","建筑"},...]
}

interface game_data_type {
  recipe_data: [];
}
import game_data_any from '@/assets/data/game_data.json';
export const calculate = ({ needs_list, natural_production_line }: needs_list_type) => {
  const multi_sources = {};
  const result_dict = {};
  const surplus_list = {};
  const lp_surplus_list = {};
  const external_supply_item = {};
  const lp_item_dict = {};
  const game_data: game_data_type = game_data_any;
  var in_out_list: { [key: string]: any } = {};

  let item_data = get_item_data();
  for (var item in needs_list) {
    in_out_list[item] = needs_list[item];
  } //将需求目标添至计算的实际需求列表中
  for (var id in natural_production_line) {
    var recipe =
      game_data.recipe_data[
        item_data[natural_production_line[id]['product_id']][natural_production_line[id]['recipe_id']]
      ];
    var recipe_time =
      (60 *
        natural_production_line[id]['construction_quantity'] *
        game_data.factory_data[recipe['facility_id']][natural_production_line[id]['building']]['multiple']) /
      recipe['item'];
    if (natural_production_line[id]['喷涂点数'] == 0 || natural_production_line[id]['增产模式'] == 0) {
      for (var item in recipe['原料']) {
        if (item in in_out_list) {
          in_out_list[item] = Number(in_out_list[item]) + recipe['原料'][item] * recipe_time;
        } else {
          in_out_list[item] = recipe['原料'][item] * recipe_time;
        }
      }
      for (var item in recipe['产物']) {
        if (item in in_out_list) {
          in_out_list[item] = Number(in_out_list[item]) - recipe['产物'][item] * recipe_time;
        } else {
          in_out_list[item] = -1 * recipe['产物'][item] * recipe_time;
        }
      }
    } else {
      var num = 0; //单次配方喷涂的物品量
      for (var item in recipe['原料']) {
        num += recipe['原料'][item];
      }
      num = Number(num) * recipe_time;
      if (natural_production_line[id]['增产模式'] == 1) {
        //增产
        var pro_time = game_data.proliferate_effect[natural_production_line[id]['喷涂点数']]['增产效果'];
        for (var item in recipe['原料']) {
          if (item in in_out_list) {
            in_out_list[item] = Number(in_out_list[item]) + recipe['原料'][item] * recipe_time;
          } else {
            in_out_list[item] = recipe['原料'][item] * recipe_time;
          }
        }
        for (var item in proliferator_price[natural_production_line[id]['喷涂点数']]) {
          if (item in in_out_list) {
            in_out_list[item] =
              Number(in_out_list[item]) + proliferator_price[natural_production_line[id]['喷涂点数']][item] * num;
          } else {
            in_out_list[item] = proliferator_price[natural_production_line[id]['喷涂点数']][item] * num;
          }
        }
        for (var item in recipe['产物']) {
          if (item in in_out_list) {
            in_out_list[item] = Number(in_out_list[item]) - recipe['产物'][item] * recipe_time * pro_time;
          } else {
            in_out_list[item] = -1 * recipe['产物'][item] * recipe_time * pro_time;
          }
        }
      } else if (natural_production_line[id]['增产模式'] == 2) {
        //加速
        var pro_time = game_data.proliferate_effect[natural_production_line[id]['喷涂点数']]['speedup'];
        for (var item in recipe['原料']) {
          if (item in in_out_list) {
            in_out_list[item] = Number(in_out_list[item]) + recipe['原料'][item] * recipe_time * pro_time;
          } else {
            in_out_list[item] = recipe['原料'][item] * recipe_time * pro_time;
          }
        }
        for (var item in proliferator_price[natural_production_line[id]['喷涂点数']]) {
          if (item in in_out_list) {
            in_out_list[item] =
              Number(in_out_list[item]) +
              proliferator_price[natural_production_line[id]['喷涂点数']][item] * num * pro_time;
          } else {
            in_out_list[item] = proliferator_price[natural_production_line[id]['喷涂点数']][item] * num * pro_time;
          }
        }
        for (var item in recipe['产物']) {
          if (item in in_out_list) {
            in_out_list[item] = Number(in_out_list[item]) - recipe['产物'][item] * recipe_time * pro_time;
          } else {
            in_out_list[item] = -1 * recipe['产物'][item] * recipe_time * pro_time;
          }
        }
      } else if (natural_production_line[id]['增产模式'] == 4) {
        var pro_time = game_data.proliferate_effect[natural_production_line[id]['喷涂点数']]['speedup'];
        for (var item in recipe['原料']) {
          if (item in in_out_list) {
            in_out_list[item] = Number(in_out_list[item]) + recipe['原料'][item] * recipe_time;
          } else {
            in_out_list[item] = recipe['原料'][item] * recipe_time;
          }
        }
        for (var item in proliferator_price[natural_production_line[id]['喷涂点数']]) {
          if (item in in_out_list) {
            in_out_list[item] =
              Number(in_out_list[item]) + proliferator_price[natural_production_line[id]['喷涂点数']][item] * num;
          } else {
            in_out_list[item] = proliferator_price[natural_production_line[id]['喷涂点数']][item] * num;
          }
        }
        for (var item in recipe['产物']) {
          if (item in in_out_list) {
            in_out_list[item] = Number(in_out_list[item]) - recipe['产物'][item] * recipe_time * pro_time;
          } else {
            in_out_list[item] = -1 * recipe['产物'][item] * recipe_time * pro_time;
          }
        }
      }
    }
  } //将固有产线的输入输出添至计算的实际需求列表中
};

function get_item_data() {
  var item_data: any = {}; //通过读取配方表得到配方中涉及的物品信息，item_data中的键名为物品名，键值为此物品在计算器中的id与用于生产此物品的配方在配方表中的序号
  var i = 0;
  for (var num = 0; num < game_data.recipe_data.length; num++) {
    for (var item in game_data.recipe_data[num].产物) {
      if (!(item in item_data)) {
        item_data[item] = [i];
        i++;
      }
      item_data[item].push(num);
    }
  }
  return item_data;
} //初始化载入物品信息
