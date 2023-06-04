
// import DSP from '@/assets/data/DSP.json';
import game_data from '@/assets/data/game_data.json';
import useConfigStore from '@/store/config';
const config = useConfigStore();
import solver from 'javascript-lp-solver'
let list_data = []

//多余产物的 对象例子 { "氢":{ "精炼油":213,"石墨":"2132"} }
let excessProduct = {}

var recipe_lists = init_recipe_list()

var item_data = get_item_data();
/*game_data是除非换游戏或者加mod不会动到的固定数据
  game_data数据内容说明:
      recipe_data：配方表
          记录配方数据的数组，数组中每一个元素即是一个配方的数据，以字典形式存储，其中各个键值对意义为：
              原料：完成一趟此配方需要的物品类型及相应数目
              产物：完成一趟此配方将产出的物品类型及相应数目
              设施：可以用于完成此配方的工厂类型
              时间：完成一趟此配方所需要的时间。其中，较为特殊的是：
                  采矿设备的时间规定为1s，即小矿机在矿物利用等级为1级时开采2簇矿物时的单位矿物产出时间
                  采集器的时间定规为1s，是矿物利用等级为1级时采集器在面板为0.125/s的巨星上采集的算入供电消耗前的单位矿物产出时间
                  抽水设备的时间规定为1.2s，是矿物利用等级为1级时单个抽水机的单位产出时间
                  抽油设备的时间规定为1s,是矿物利用等级为1级时单个萃取站在面板为1/s的油井上的单位产出时间
                  分馏塔的时间规定为100s，是让氢以1/s速度过带时的期望单位产出时间
                  蓄电器（满）的时间定为300s，是直接接入电网时充满电的时间（直接接入电网，设备倍率为1，使用能量枢纽，则设备倍率为50）
              增产：此配方的可增产情况，可以看做是2位2进制数所表示的一个值，第一位代表是否能加速，第二位代表是否能增产，比如0代表此配方既不能增产也不能加速，
                  2代表可以加速但不能增产，3代表既可以加速也可以增产等...其中，存在一个特例，当使用射线接受站接受光子时用上引力透镜，则引力透镜加速时可以让
                  产出翻倍，但不增加引力透镜消耗速度，**用4表示这种只能加速但不加倍原料消耗的配方

      proliferator_data：增产剂效果字典
          记录增产剂效能的数组，数组中第i个元素即为第i级增产剂的数据，以字典形式存储，其中各个键值对的意义为：
              增产剂名称：增产剂在游戏中的名字，其中，0级增产剂名为“不使用增产剂
              additional_effect：使用此增产剂在额外产出模式时的output-ratio，如3级增产剂的additional_effect为1.25
              speedup：使用此增产剂在生产加速模式时的output-ratio，如3级增产剂的speedup为2
              power-ratio：使用此增产剂时工厂的power-ratio，如3级增产剂的power-ratio为2.5
              喷涂次数：增产剂在未被喷涂的情况下的面板喷涂次数，如3级增产剂的喷涂次数为60

      factory_data:建筑参数表
          记录各种工厂数值的字典，字典的键名为设施种类，如“Production platform”、“冶炼设备”等，建值为属于这一设备种类的设备参数，以字典形式储存，字典中的键名为建筑名字，
          建值则是代表这一建筑参数的字典，字典中各个键值对的意义为：
              耗能：工厂的额定工作功率，单位为MW，如Production platformMK.Ⅲ的耗能为1.08
              倍率：工厂的额定工作速度，即实际生产速度与配方面板速度的比值，如Production platformMK.Ⅲ的倍率为1.5
              占地：目前定义为工厂建筑的占地面积，因为工厂的实际占地面积计算较为复杂。当前的想法是这个表的数据仅用作记录工厂建筑本身的占地面积，占地的单位
                  面积定义为游戏中一纬线间隔的平方（即游戏内的约1.256637m），之后通过其他数据结构来给涉及物品数目不同的相同建筑通过算法将进出货物时的分拣
                  器与传送带的占地也考虑上，届时会有不同的铺设模式对应不同的分拣器传送带占地。建筑占地本身也会因是否使用建筑偏移而有所改动。
*/
const scheme_data = {
  "item_recipe_choices": {},
  "scheme_for_recipe": [{ "architecture": 0, "additional_level": 0, "additional_mode": 0, "additional_mode_index": 0 }],
  "cost_weight": {
    "占地": 1,
    "电力": 0,
    "construction_cost": {
      "分拣器": 0,
      "Production platform": 0, // 制作台
    },

    "additional_cost_of_product": {
      "单极磁石": { "成本": 10, "启用": 1, "与其它成本累计": 0 },
      "铁": { "成本": 1, "启用": 0, "与其它成本累计": 0 }
    }
  },
  "mining_rate": {
    "科技面板倍率": 1.0,
    "小矿机覆盖矿脉数": 8,
    "大矿机覆盖矿脉数": 16,
    "大矿机工作倍率": 3,
    "油井期望面板": 3,
    "巨星氢面板": 1,
    "巨星重氢面板": 0.2,
    "巨星可燃冰面板": 0.5,
    "伊卡洛斯手速": 1
  },
  "fractionating_speed": 1,
  "energy_contain_miner": 0
}//在非导入的情况会依据game_data生成默认值，这里的内容仅做示例，这个一样应该存在本地json里的，目前存在html的localStorage里


{/*初始化生产策略数据
  scheme_data是用户根据自己选取的配方策略而制定的数据
  scheme_data数据内容说明:
      item_recipe_choices:物品来源配方选取
          物品的来源配方列表存在由game_data生成的item_data列表中中的对应元素。
          item_data列表在下标为1~length-1的区域中存放着指向可以生产这个物品的配方在game_data.recipe_data中的id
          比如item_data["氢"] = [氢在list(item_data)中的id,采集器取氢的配方id，高效石墨烯的配方id，原油精炼的配方id...等]
          而item_recipe_choices["氢"] == 1就代表着需要使用额外的氢时我们选用轨道采集器来获取
      scheme_for_recipe：配方参数配置列表
          长度和game_data.recipe_data一致，列表中每一个元素都是一个字典，字典的内容为：
              'architecture':表示完成此配方使用的建筑在data["factory_data"]中的同一类工厂中的序号
              'additional_level':表示选取什么等级的增产剂（0为不使用，1、2、4分别对应增产剂MK.Ⅰ、Ⅱ、Ⅲ）
              'additional_mode':表示选取何种additional_mode（0为不增产，1为增产，2为加速）
*/}

{//这里是前端按钮调用的布局相关的函数
  function addNeeds() {
    var needs_item = document.getElementById("needs_item").value;
    var needs_amount = document.getElementById("needs_amount").value;
    if (!(needs_item in item_data)) {
      alert("请输入或选择正确的物品名字！");
      return;
    }
    if (Object.keys(needs_list).length == 0) {
      document.getElementById("resetNeeds").innerHTML = "<button id=\"all\" onclick=\"resetNeeds('all')\">清空所有需求</button>" + "<br />";
    }//如果一开始没有物品，那就加一个以前清楚的按钮，有物品必有按钮，就不用加了
    if (!(needs_item in needs_list)) {
      needs_list[needs_item] = Number(needs_amount);
    }
    else {
      needs_list[needs_item] = Number(needs_list[needs_item]) + Number(needs_amount);
    }
    show_needs_list(); /// 展示需求列表
  }//增添需求

  function resetNeeds(item) {
    if (item in needs_list) {
      delete needs_list[item];
    }
    if (item == "all") {
      needs_list = {};
    }
    show_needs_list();
    // calculate();
    if (Object.keys(needs_list).length == 0) {
      document.getElementById("resetNeeds").innerHTML = "";
    }
  }//更改需求

  function changeNeeds(item) {
    var num = document.getElementById("needs_of_" + item).value;
    if (item in needs_list) {
      needs_list[item] = Number(num);
    }
    show_needs_list();
  }
  function loadData() {
    var data_of_game = JSON.parse(localStorage.getItem('game_data'));
    if (data_of_game) {
      game_data = JSON.parse(localStorage.getItem('game_data'));
      item_data = get_item_data();
    }
  }//读取游戏数据

  function saveData() {
    localStorage.setItem('game_data', JSON.stringify(game_data));
  }//保存游戏数据

  function saveScheme() {
    localStorage.setItem('scheme_data', JSON.stringify(scheme_data));
  }//保存生产策略

  function loadScheme() {
    var scheme = JSON.parse(localStorage.getItem('scheme_data'));
    if (scheme) {
      scheme_data = JSON.parse(localStorage.getItem('scheme_data'));
    }
    // calculate();
  }//读取生产策略

  function clearData() {
    localStorage.clear();
  }//清空所有缓存


  function ChangeSchemeOf(item) {
    let recipe_id = item_data[item][scheme_data.item_recipe_choices[item]];
    scheme_data.scheme_for_recipe[recipe_id]["additional_level"] = document.getElementById("pro_num_for_" + item).value;
    scheme_data.scheme_for_recipe[recipe_id]["additional_mode"] = document.getElementById("pro_mode_for_" + item).value;
    scheme_data.scheme_for_recipe[recipe_id]["architecture"] = document.getElementById("factory_for_" + item).value;
    // change_result_row_for_item(item);
  }//切换配方制造时的选项

  function init_item_list() {
    var str = "";
    for (var i in item_data) {
      str += "<option value=\"" + i + "\">\n";
    }
    document.getElementById("item_list").innerHTML = str;
  }//初始化物品html上物品列表选项

  function if_proliferate_itself(proliferate_itself) {
    proliferator_price = init_pro_proliferator(proliferate_itself);
    if (proliferate_itself) {
      document.getElementById("是否自喷涂").innerHTML = "<button onclick=\"if_proliferate_itself(0)\">自喷涂?</button>Yes!";
    }
    else {
      document.getElementById("是否自喷涂").innerHTML = "<button onclick=\"if_proliferate_itself(1)\">自喷涂?</button>No!";
    }
  }//增产剂自喷涂勾选选项

  function changeFixedNum() {
    fixed_num = document.getElementById("显示精度").value;
    if (fixed_num <= 0) fixed_num = 0;
    show_result_dict();
  }//更改显示精度

  function ChangeBuildingLayer(building) {
    stackable_buildings[building] = document.getElementById("stack_of_" + building).value;

  }

  function changeMiningRate(i) {
    scheme_data.mining_rate[i] = Number(document.getElementById("mining_rate_" + i).value);

  }

  function addNaturalProductionLine() {
    // natural_production_line.push({ "目标物品": "氢", "建筑数量": 0, "recipe_id": 1, "additional_level": 0, "additional_mode": 0, "architecture": 0 })
    show_natural_production_line();
  }

  function NPc(i) {
    natural_production_line[i]["recipe_id"] = document.getElementById("recipe_of_natural_production_" + i).value;
    natural_production_line[i]["architecture"] = 0;
    natural_production_line[i]["additional_mode"] = 0;
    show_natural_production_line();

  }

  function NPChangeSchemeOf(i) {
    natural_production_line[i]["architecture"] = document.getElementById("factory_of_natural_production_" + i).value;
    natural_production_line[i]["additional_mode"] = document.getElementById("pro_mode_of_natural_production_" + i).value;
    natural_production_line[i]["additional_level"] = document.getElementById("pro_num_of_natural_production_" + i).value;
    natural_production_line[i]["建筑数量"] = document.getElementById("building_num_of_natural_production_" + i).value;
    show_natural_production_line();

  }

  function NPDeleteLine(i) {
    for (var j = i; j < natural_production_line.length; j++) {
      natural_production_line[j] = natural_production_line[j + 1];
    }
    natural_production_line.pop();
    show_natural_production_line();

  }

  function NPChangeItem(i) {
    var item = document.getElementById("item_of_natural_production_" + i).value;
    if (!(item in item_data)) {
      alert("请输入或选择正确的物品名字！");
    }
    else {
      natural_production_line[i]["目标物品"] = item;
    }
    natural_production_line[i]["recipe_id"] = 1;
    natural_production_line[i]["architecture"] = 0;
    natural_production_line[i]["additional_mode"] = 0;
    show_natural_production_line();
    // calculate();
  }//改变固有产线物品

  function changeFractionatingSpeed() {
    scheme_data.fractionating_speed = Number(document.getElementById("分馏塔过氢带速").value);
    if (scheme_data.fractionating_speed > 1800) {
      game_data.factory_data["分馏设备"][0]["耗能"] = scheme_data.fractionating_speed * 0.0006 - 0.36;
    }
    else {
      game_data.factory_data["分馏设备"][0]["耗能"] = 0.72;
    }
  }//更改分馏塔过氢带速

  function IfEnergyContainMiner() {
    scheme_data.energy_contain_miner = (scheme_data.energy_contain_miner + 1) % 2;
    // calculate();
  }
}//这里是前端按钮调用的布局相关的函数

{//这里是script内部调用用到的主要逻辑需要的函数
  {
    // function init() {
    //   needs_list = {};
    //   item_data = get_item_data();
    //   scheme_data = init_scheme_data();
    //   proliferator_price = init_pro_proliferator();
    //   multi_sources = {};
    //   item_graph = build_item_graph();
    // }//在用户一通瞎几把操作后在需要的时候初始化

    // function show_mining_setting() {
    //   var str = "";
    //   for (var i in scheme_data.mining_rate) {
    //     str += i + ":<input type=\"text\" size=\"6\" id=\"mining_rate_" + i + "\" value=\"" + scheme_data.mining_rate[i] + "\" onchange=\"changeMiningRate('" + i + "')\"/>";
    //   }
    //   // document.getElementById("采矿参数").innerHTML = str;
    // }//采矿相关UI接口

    // function show_natural_production_line() {
    //   var str = "";
    //   for (var i in natural_production_line) {
    //     str += "<tr id=\"natural_production_" + i + "\">" +
    //       "<th><input list=\"item_list\" id=\"item_of_natural_production_" + i + "\" value=\"" + natural_production_line[i]["目标物品"] + "\" onChange=\"NPChangeItem('" + i + "')\"></th>" + // 目标物品
    //       "<th><input id=\"building_num_of_natural_production_" + i + "\" value=\"" + natural_production_line[i]["建筑数量"] + "\" onChange=\"NPChangeSchemeOf('" + i + "')\">" + "</th>" +  //建筑数量
    //       "<th><select id=\"recipe_of_natural_production_" + i + "\" value=\"" + natural_production_line[i]["配方id"] + "\" onChange=\"NPc('" + i + "')\"></th>" + // 所选配方
    //       "<th><select id=\"pro_num_of_natural_production_" + i + "\" value=\"" + natural_production_line[i]["additional_level"] + "\" onChange=\"NPChangeSchemeOf('" + i + "')\"></select></th>" + //所选增产剂
    //       "<th><select id=\"pro_mode_of_natural_production_" + i + "\" value=\"" + natural_production_line[i]["additional_mode"] + "\" onChange=\"NPChangeSchemeOf('" + i + "')\"></select></th>" + //所选additional_mode
    //       "<th><select id=\"factory_of_natural_production_" + i + "\" value=\"" + natural_production_line[i]["architecture"] + "\" onChange=\"NPChangeSchemeOf('" + i + "')\"></select></th>" + //所选工厂种类
    //       "<th><button onclick=\"NPDeleteLine('" + i + "')\">删除</button></th></tr>";
    //   }
    //   // document.getElementById("固有产线").innerHTML = str;
    //   for (var NPId in natural_production_line) {
    //     var item = document.getElementById("item_of_natural_production_" + NPId).value;
    //     var recipe_for_select = document.getElementById("recipe_of_natural_production_" + NPId);
    //     var pro_num_list = document.getElementById("pro_num_list");
    //     var pro_num_for_select = document.getElementById("pro_num_of_natural_production_" + NPId);
    //     var pro_mode_select = document.getElementById("pro_mode_of_natural_production_" + NPId);
    //     var factory_select = document.getElementById("factory_of_natural_production_" + NPId);
    //     var recipe_list = document.getElementById("recipe_list").options;
    //     recipe_for_select.innerHTML = "";
    //     pro_num_for_select.innerHTML = "";
    //     pro_mode_select.innerHTML = "";
    //     factory_select.innerHTML = "";

    //     for (var i = 1; i < item_data[item].length; i++) {
    //       var option = document.createElement("option");
    //       option.value = i;
    //       option.label = recipe_list[item_data[item][i]].label;
    //       if (natural_production_line[NPId]["recipe_id"] == i) {
    //         option.selected = "selected";
    //       }
    //       recipe_for_select.options.add(option);
    //     }//配方选取列表

    //     var recipe_id = item_data[item][natural_production_line[NPId]["recipe_id"]];
    //     for (var i = 0; i < pro_num_list.options.length; i++) {
    //       var option = document.createElement("option");
    //       option.value = pro_num_list.options[i].value;
    //       option.label = pro_num_list.options[i].value;
    //       if (natural_production_line[NPId]["additional_level"] == option.value) {
    //         option.selected = "selected";
    //       }
    //       pro_num_for_select.options.add(option);
    //     }//additional_level
    //     var pro_mode_list = document.getElementById("additional_mode" + game_data.recipe_data[recipe_id]["增产"]);
    //     for (var i = 0; i < pro_mode_list.options.length; i++) {
    //       var option = document.createElement("option");
    //       option.value = pro_mode_list.options[i].value;
    //       option.label = pro_mode_list.options[i].label;
    //       if (natural_production_line[NPId]["additional_mode"] == option.value) {
    //         option.selected = "selected";
    //       }
    //       pro_mode_select.options.add(option);
    //     }//additional_mode
    //     var factory_list = document.getElementById(game_data.recipe_data[recipe_id]["facility"] + "_list");
    //     for (var i = 0; i < factory_list.options.length; i++) {
    //       var option = document.createElement("option");
    //       option.value = factory_list.options[i].value;
    //       option.label = factory_list.options[i].label;
    //       if (natural_production_line[NPId]["architecture"] == option.value) {
    //         option.selected = "selected";
    //       }
    //       factory_select.options.add(option);
    //     }//建筑选取
    //   }//修正参数设置UI
    // }

    function batch_setting_init() {
      var str = "批量预设：";
      for (var factory in game_data.factory_data) {
        if (game_data.factory_data[factory].length >= 2) {
          str += factory + ":<select id=\"batch_setting_" + factory + "\" onChange=\"BatchChangeFactoryOf('" + factory + "')\">";
          for (var i = 0; i < game_data.factory_data[factory].length; i++) {
            str += "<option value=\"" + i + "\" label=\"" + game_data.factory_data[factory][i]["名称"] + "\"";
            if (i == 0) {
              str += " selected"
            }
            str += "\/>";
          }
          str += "</select>";
        }
      }
      str += "additional_level:<select id=\"batch_setting_pro_num\" onChange=\"BatchChangeProNum()\">";
      for (var i = 0; i < game_data.proliferate_effect.length; i++) {
        if (proliferator_price[i] != -1)
          str += "<option value=\"" + i + "\" label=\"" + i + "\"\/>";
      }
      str += "</select>additional_mode:<select id=\"batch_setting_pro_mode\" onChange=\"BatchChangeProMode()\">";
      str += "<option value=\"0\" label = \"不使用增产剂\"\/>" + "<option value=\"1\" label = \"增产\"\/>" +
        "<option value=\"2\" label = \"加速\"\/>";
      document.getElementById("批量预设").innerHTML = str;
    }//初始化批量预设

    function building_stack_init() {
      var str = "建筑层数:";
      for (var building in stackable_buildings) {
        str += building + ":<input id=\"stack_of_" + building + "\" type=\"number\" value=\"" + stackable_buildings[building] + "\"onChange=\"ChangeBuildingLayer('" + building + "')\">";
      }
      document.getElementById("建筑层数").innerHTML = str;
    }

    function init_pro_num_list() {
      var str = "";
      for (var i = 0; i < game_data.proliferate_effect.length; i++) {
        if (proliferator_price[i] != -1)
          str += "<option value=\"" + i + "\">";
      }
      document.getElementById("pro_num_list").innerHTML = str;
    }//初始化可用喷涂点数列表

    // function init_pro_mode_list() {
    //   var str = "";
    //   str += "<datalist id=\"additional_mode0\">\n";
    //   str += "<option value=\"0\" label=\"不使用增产剂\">\n";
    //   str += "</datalist>\n";
    //   str += "<datalist id=\"additional_mode1\">\n";
    //   str += "<option value=\"0\" label=\"不使用增产剂\">\n";
    //   str += "<option value=\"1\" label=\"增产\">\n";
    //   str += "</datalist>\n";
    //   str += "<datalist id=\"additional_mode2\">\n";
    //   str += "<option value=\"0\" label=\"不使用增产剂\">\n";
    //   str += "<option value=\"2\" label=\"加速\">\n";
    //   str += "</datalist>\n";
    //   str += "<datalist id=\"additional_mode3\">\n";
    //   str += "<option value=\"0\" label=\"不使用增产剂\">\n";
    //   str += "<option value=\"1\" label=\"增产\">\n";
    //   str += "<option value=\"2\" label=\"加速\">\n";
    //   str += "</datalist>\n";
    //   str += "<datalist id=\"additional_mode4\">\n";
    //   str += "<option value=\"0\" label=\"不使用增产剂\">\n";
    //   str += "<option value=\"4\" label=\"接收站透镜喷涂\">\n";
    //   str += "</datalist>\n";
    //   document.getElementById("pro_mode_list").innerHTML = str;
    // }//初始化可选additional_mode列表

    function init_factory_list() {
      var str = ""; 3
      for (var factory in game_data["factory_data"]) {
        str += "<datalist id=\"" + factory + "_list\">";
        for (var building in game_data["factory_data"][factory]) {
          str += "<option value=\"" + building +
            "\" label=\"" + game_data["factory_data"][factory][building]["名称"] + "\">";
        }
        str += "</datalist>\n";
      }
      document.getElementById("factory_list").innerHTML = str;
    }//初始化建筑列表

  }//初始化相关

  // {
  //   function show_needs_list() {
  //     var str = "需求列表：<br />";
  //     for (var i in needs_list) {
  //       str += i + ":<input type=\"text\" size=\"6\" value=\"" + needs_list[i] + "\" " + "id=\"needs_of_" + i + "\" onchange=\"changeNeeds('" + i + "')\">个/min"
  //         + "<button id=\"" + i + "需求" + "\" onclick=\"resetNeeds('" + i + "')\">清空需求</button><br />";
  //     }
  //     document.getElementById("totalNeeds").innerHTML = str;
  //   }//展示需求列表

  // function show_mineralize_list() {
  //   if (Object.keys(mineralize_list).length > 0) {
  //     var str = "原矿化：";
  //     for (var item in mineralize_list) {
  //       str += "<th><button onclick=\"unmineralize('" + item + "')\">" + item + "</button></th></tr>";
  //     }
  //     document.getElementById("原矿化列表").innerHTML = str;
  //   }
  //   else {
  //     document.getElementById("原矿化列表").innerHTML = "";
  //   }
  // }//显示原矿化列表

  // function show_surplus_list() {
  //   var str = "";
  //   for (var i in lp_surplus_list) {
  //     str +=
  //       "<tr><th>" + i + "</th>" +  //目标物品
  //       "<th>" + lp_surplus_list[i] + "</th></tr>"; //分钟冗余
  //   }
  //   // document.getElementById("surplus_list").innerHTML = str;
  // }//显示多余产出
  // }//运行逻辑相关

}//这里是script内部调用用到的主要逻辑需要的函数


{//初始化以及主要逻辑
  var needs_list = {};//物品需求列表
  var natural_production_line = [];//固有产线的输入输出影响,格式为[0号产线{"目标物品","建筑数量","配方id","additional_level","additional_mode","architecture"},...]
  var mineralize_list = {};//原矿化列表，代表忽视哪些物品的原料
  var stackable_buildings = { "研究站": 15 };


  // 通过读取配方表得到配方中涉及的物品信息，item_data中的键名为物品名，
  // 键值为此物品在计算器中的id与用于生产此物品的配方在配方表中的序号

  init_scheme_data(); //初始化物品的来源配方决策
  var proliferator_price = init_pro_proliferator(1);

  // 代表0~10级增产点数的喷涂效果的成本列表
  // 如果为-1，则表示该等级的喷涂不可用

  var multi_sources = {};//初始化多来源物品表
  var lp_item_dict = {};//线性规划相关物品需求表
  var external_supply_item = {};//外部供应物品
  var side_item_dict = {};
  var surplus_list = {};
  var lp_surplus_list = {};
  var item_graph = build_item_graph();//初始化产物关系图
  var result_dict = {};
  var fixed_num = 2;
  var key_item_list = [];
  var item_list = [];
  var item_price = {};
  var building_list = {};
  var energy_cost = 0;
  build_item_list();
  item_price = get_item_price();
  initDate()

}//主要逻辑

//主要计算逻辑
export const calculate = (needs_list) => {
  excessProduct = {}
  scheme_data.mining_rate = {
    "科技面板倍率": config.scienceResearchSpeed,
    "小矿机覆盖矿脉数": config.miniCore,
    "大矿机覆盖矿脉数": config.largeCore,
    "大矿机工作倍率": config.largeCoreWorkingSpeed,
    "油井期望面板": config.oilWellSpeed,
    "巨星氢面板": config.hydrogenCollectionRate,
    "巨星重氢面板": config.heavyHydrogenCollectionRate,
    "巨星可燃冰面板": config.combustibleIceCollectionRate,
    "伊卡洛斯手速": config.shooter,
  };
  scheme_data.energy_contain_miner = config.energy_contain_miner
  multi_sources = {};
  result_dict = {};
  surplus_list = {};
  lp_surplus_list = {};
  external_supply_item = {};
  lp_item_dict = {};
  var in_out_list = {};
  for (var item in needs_list) {
    in_out_list[item] = needs_list[item];
  }//将需求目标添至计算的实际需求列表中
  for (const id in natural_production_line) {
    var recipe = game_data.recipe_data[item_data[natural_production_line[id]["目标物品"]][natural_production_line[id]["recipe_id"]]];

    var recipe_time = 60 * natural_production_line[id]["建筑数量"] * game_data.factory_data[recipe["facility"]][natural_production_line[id]["architecture"]]["倍率"] / recipe["time"];
    console.log("recipe_time", recipe_time);
    if ((natural_production_line[id]["additional_level"] == 0) || (natural_production_line[id]["additional_mode"] == 0)) {
      for (var item in recipe["material"]) {
        if (item in in_out_list) {
          in_out_list[item] = Number(in_out_list[item]) + recipe["material"][item] * recipe_time;
        } else {
          in_out_list[item] = recipe["material"][item] * recipe_time;
        }
      }
      for (var item in recipe["product"]) {
        if (item in in_out_list) {
          in_out_list[item] = Number(in_out_list[item]) - recipe["product"][item] * recipe_time;
        } else {
          in_out_list[item] = -1 * recipe["product"][item] * recipe_time;
        }
      }
    } else {
      var num = 0;//单次配方喷涂的物品量
      for (var item in recipe["material"]) {
        num += recipe["material"][item];
      }
      num = Number(num) * recipe_time;
      if (natural_production_line[id]["additional_mode"] == 1) {//增产
        var pro_time = game_data.proliferate_effect[natural_production_line[id]["additional_level"]]["additional_effect"];
        for (var item in recipe["material"]) {
          if (item in in_out_list) {
            in_out_list[item] = Number(in_out_list[item]) + recipe["material"][item] * recipe_time;
          }
          else {
            in_out_list[item] = recipe["material"][item] * recipe_time;
          }
        }
        for (var item in proliferator_price[natural_production_line[id]["additional_level"]]) {
          if (item in in_out_list) {
            in_out_list[item] = Number(in_out_list[item]) + proliferator_price[natural_production_line[id]["additional_level"]][item] * num;
          }
          else {
            in_out_list[item] = proliferator_price[natural_production_line[id]["additional_level"]][item] * num;
          }
        }
        for (var item in recipe["product"]) {
          if (item in in_out_list) {
            in_out_list[item] = Number(in_out_list[item]) - recipe["product"][item] * recipe_time * pro_time;
          }
          else {
            in_out_list[item] = -1 * recipe["product"][item] * recipe_time * pro_time;
          }
        }
      }
      else if (natural_production_line[id]["additional_mode"] == 2) {//加速
        var pro_time = game_data.proliferate_effect[natural_production_line[id]["additional_level"]]["speedup"];
        for (var item in recipe["material"]) {
          if (item in in_out_list) {
            in_out_list[item] = Number(in_out_list[item]) + recipe["material"][item] * recipe_time * pro_time;
          }
          else {
            in_out_list[item] = recipe["material"][item] * recipe_time * pro_time;
          }
        }
        for (var item in proliferator_price[natural_production_line[id]["additional_level"]]) {
          if (item in in_out_list) {
            in_out_list[item] = Number(in_out_list[item]) + proliferator_price[natural_production_line[id]["additional_level"]][item] * num * pro_time;
          }
          else {
            in_out_list[item] = proliferator_price[natural_production_line[id]["additional_level"]][item] * num * pro_time;
          }
        }
        for (var item in recipe["product"]) {
          if (item in in_out_list) {
            in_out_list[item] = Number(in_out_list[item]) - recipe["product"][item] * recipe_time * pro_time;
          }
          else {
            in_out_list[item] = -1 * recipe["product"][item] * recipe_time * pro_time;
          }
        }
      }
      else if (natural_production_line[id]["additional_mode"] == 4) {
        var pro_time = game_data.proliferate_effect[natural_production_line[id]["additional_level"]]["speedup"];
        for (var item in recipe["material"]) {
          if (item in in_out_list) {
            in_out_list[item] = Number(in_out_list[item]) + recipe["material"][item] * recipe_time;
          }
          else {
            in_out_list[item] = recipe["material"][item] * recipe_time;
          }
        }
        for (var item in proliferator_price[natural_production_line[id]["additional_level"]]) {
          if (item in in_out_list) {
            in_out_list[item] = Number(in_out_list[item]) + proliferator_price[natural_production_line[id]["additional_level"]][item] * num;
          }
          else {
            in_out_list[item] = proliferator_price[natural_production_line[id]["additional_level"]][item] * num;
          }
        }
        for (var item in recipe["product"]) {
          if (item in in_out_list) {
            in_out_list[item] = Number(in_out_list[item]) - recipe["product"][item] * recipe_time * pro_time;
          }
          else {
            in_out_list[item] = -1 * recipe["product"][item] * recipe_time * pro_time;
          }
        }
      }
    }
  }//将固有产线的输入输出添至计算的实际需求列表中

  for (const item in in_out_list) {
    if (in_out_list[item] < 0) {
      external_supply_item[item] = in_out_list[item];
    }
  }//将实际需求列表中小于0的部分看做外部输入

  item_graph = build_item_graph();

  build_item_list();
  item_price = get_item_price();


  for (const item in in_out_list) {
    if (in_out_list[item] > 0) {
      if (item in result_dict) {
        result_dict[item] = Number(result_dict[item]) + in_out_list[item];
      }
      else {
        result_dict[item] = in_out_list[item];
      }

      //如果是线性规划相关物品的by-product因为这边是原矿化的所以不应考虑其by-product 副产品
      if (item_graph[item]["by-product"] && !(item in multi_sources) && !(item in key_item_list)) {
        for (var other_products in item_graph[item]["by-product"]) {
          if (other_products in surplus_list) {
            surplus_list[other_products] = Number(surplus_list[other_products]) + item_graph[item]["by-product"][other_products] * in_out_list[item];
          }
          else {
            surplus_list[other_products] = item_graph[item]["by-product"][other_products] * in_out_list[item];
          }
        }
      }
      for (var material in item_price[item]["material"]) {
        if (material in result_dict) {
          result_dict[material] = Number(result_dict[material]) + item_price[item]["material"][material] * in_out_list[item];
        }
        else {
          result_dict[material] = item_price[item]["material"][material] * in_out_list[item];
        }
        if (item_graph[material]["by-product"] && !(material in multi_sources) && !(material in key_item_list)) {
          for (var other_products in item_graph[material]["by-product"]) {
            if (other_products in surplus_list) {
              surplus_list[other_products] = Number(surplus_list[other_products]) + item_graph[material]["by-product"][other_products] * item_price[item]["material"][material] * in_out_list[item];
            }
            else {
              surplus_list[other_products] = item_graph[material]["by-product"][other_products] * item_price[item]["material"][material] * in_out_list[item];
            }
          }
        }
      }
    }
  }//遍历物品的item_price降可迭代物品的生产结果和by-product产出结果放入输出结果内


  for (const item in multi_sources) {
    if (item in result_dict) {
      if (item in surplus_list) {
        lp_item_dict[item] = result_dict[item] - surplus_list[item];
      } else {
        lp_item_dict[item] = result_dict[item];
      }
    }
    else {
      if (item in surplus_list) {
        lp_item_dict[item] = -surplus_list[item];
      }
      else {
        lp_item_dict[item] = 0;
      }
    }
  }//将多来源配方物品的总需求与总富余相减后放入线性规划相关物品表
  for (var item in external_supply_item) {
    if (!(item in multi_sources)) {
      if (item in result_dict) {
        lp_item_dict[item] = result_dict[item] + in_out_list[item];
      }
      else {
        lp_item_dict[item] = in_out_list[item];
      }
    }
    else {
      lp_item_dict[item] = Number(lp_item_dict[item]) + in_out_list[item];
    }
  }//将定量外部供应的物品放入线性规划相关物品表
  for (var item in key_item_list) {
    if (!(key_item_list[item] in multi_sources) && !(key_item_list[item] in external_supply_item)) {
      if ([key_item_list[item]] in result_dict) {
        lp_item_dict[key_item_list[item]] = result_dict[key_item_list[item]];
      }
      else {
        lp_item_dict[key_item_list[item]] = 0;
      }
    }
  }//将循环关键物品的总需求放入线性规划相关物品表

  var lp_cost = get_linear_programming_list();//线规最终目标函数成本，在考虑要不要显示


  show_result_dict();

  // console.log("配方列表信息", result_dict)
  // console.log("冗余信息列表", lp_surplus_list)
  // console.log("所需建筑", building_list)
  // console.log("配方列表 recipe_lists", recipe_lists)
  // console.log("产物初始化信息 item_data", item_data)
  // console.log("配方item_recipe_choices", scheme_data.item_recipe_choices)
  // console.log("配方scheme_for_recipe", scheme_data.scheme_for_recipe)
  // console.log("多余产物信息excessProduct", excessProduct)

  // 将多余的产物删除掉
  for (const key in excessProduct) {
    if (Object.hasOwnProperty.call(excessProduct, key)) {
      const element = excessProduct[key];
      if (element == 0) {
        delete excessProduct[key]
      }
    }
  }
  list_data = list_data.filter(item => {
    return !(Number(item.efficiency) == 0 && !excessProduct[item.key])
  })
  return {
    result_dict,
    building_list,
    item_data,
    excessProduct,
    recipe_lists,
    mineralize_list,
    energy_cost,
    list_data: list_data,
    scheme_for_recipe: scheme_data.scheme_for_recipe,
    item_recipe_choices: scheme_data.item_recipe_choices,
  }
}//计算主要逻辑框架

function get_item_data() {
  var item_data = {};//通过读取配方表得到配方中涉及的物品信息，item_data中的键名为物品名，键值为此物品在计算器中的id与用于生产此物品的配方在配方表中的序号
  var i = 0;
  for (var num = 0; num < game_data.recipe_data.length; num++) {
    for (var item in game_data.recipe_data[num].product) {
      if (!(item in item_data)) {
        item_data[item] = [i];
        i++;
      }
      item_data[item].push(num);
    }
  }
  return item_data;
}//初始化载入物品信息

function init_scheme_data() {
  scheme_data.item_recipe_choices = {};
  scheme_data.scheme_for_recipe = [];
  scheme_data.cost_weight["占地"] = 1;
  scheme_data.cost_weight["电力"] = 0;
  scheme_data.cost_weight["construction_cost"] = { "分拣器": 0 };
  scheme_data.cost_weight["additional_cost_of_product"] = {};
  scheme_data.mining_rate = {
    "科技面板倍率": 1.0,
    "小矿机覆盖矿脉数": 8,
    "大矿机覆盖矿脉数": 16,
    "大矿机工作倍率": 3,
    "油井期望面板": 3,
    "巨星氢面板": 1,
    "巨星重氢面板": 0.2,
    "巨星可燃冰面板": 0.5,
    "伊卡洛斯手速": 1
  };
  for (var factory in game_data.factory_data) {
    for (var building_id in game_data.factory_data[factory]) {
      scheme_data.cost_weight["construction_cost"][game_data.factory_data[factory][building_id]["名称"]] = 0;
    }
  }
  for (var item in item_data) {
    scheme_data.cost_weight["additional_cost_of_product"][item] = { "成本": 0, "启用": 0, "与其它成本累计": 0 };
  }
  for (var item in item_data) {
    scheme_data.item_recipe_choices[item] = 1;
  }
  for (var i = 0; i < game_data.recipe_data.length; i++) {
    scheme_data.scheme_for_recipe.push({ "architecture": 0, "additional_level": 0, "additional_mode": 0, "additional_mode_index": 0 });
  }
}//初始化配方选取

function init_pro_proliferator(proliferate_itself) {

  var proliferator_price = [];
  proliferator_price.push({});
  for (var i = 1; i < game_data.proliferate_effect.length; i++) {
    proliferator_price.push(-1);
  }
  for (var i in game_data.proliferator_data) {
    if (game_data.proliferator_data[i]["单次喷涂最高增产点数"] != 0) {
      proliferator_price[game_data.proliferator_data[i]["单次喷涂最高增产点数"]] = {};
      if (proliferate_itself) {
        proliferator_price[game_data.proliferator_data[i]["单次喷涂最高增产点数"]][i]
          = 1 / (game_data.proliferator_data[i]["喷涂次数"] *
            game_data.proliferate_effect[game_data.proliferator_data[i]["单次喷涂最高增产点数"]]["additional_effect"] - 1);
      }
      else {
        proliferator_price[game_data.proliferator_data[i]["单次喷涂最高增产点数"]][i]
          = 1 / game_data.proliferator_data[i]["喷涂次数"];
      }
    }
  }
  return proliferator_price;
}//初始化单次各个等级的喷涂效果的成本（默认选用全自喷涂）

function build_item_graph() {

  var item_graph = {};
  for (const item in item_data) {
    item_graph[item] = { "material": {}, "is-production": {}, "output-ratio": 0, "by-product": {} };
  }

  for (const item in item_data) {
    if (item in mineralize_list) {
      item_graph[item]["output-ratio"] = 1000 ** fixed_num;
      continue;
    }

    let recipe_id = item_data[item][scheme_data.item_recipe_choices[item]];

    item_graph[item]["output-ratio"] = 1 * game_data.recipe_data[recipe_id]["product"][item];
    var produce_rate = 1;//净产出一个目标产物时公式的执行次数，用于考虑增产等对原料消耗的影响
    var material_num = 0;
    var total_material_num = 0;
    var proliferate_mode = scheme_data.scheme_for_recipe[recipe_id]["additional_mode"];
    var proliferate_num = scheme_data.scheme_for_recipe[recipe_id]["additional_level"];

    for (var material in game_data.recipe_data[recipe_id]["material"]) {
      material_num = game_data.recipe_data[recipe_id]["material"][material] / game_data.recipe_data[recipe_id]["product"][item];
      item_graph[item]["material"][material] = material_num;
      total_material_num += material_num;
    }

    if (proliferate_mode && proliferate_num) {//如果有用增产剂且有additional_effect 副产物
      if (proliferate_mode == 1) {
        for (const proliferate in proliferator_price[proliferate_num]) {
          if (proliferate in item_graph[item]["material"]) {
            item_graph[item]["material"][proliferate] += total_material_num * proliferator_price[proliferate_num][proliferate];
          }
          else {
            item_graph[item]["material"][proliferate] = total_material_num * proliferator_price[proliferate_num][proliferate];
          }
        }
        produce_rate *= game_data.proliferate_effect[proliferate_num]["additional_effect"];
        item_graph[item]["output-ratio"] *= produce_rate;
      } else if (proliferate_mode == 2) {
        for (const proliferate in proliferator_price[proliferate_num]) {
          if (proliferate in item_graph[item]["material"]) {
            item_graph[item]["material"][proliferate] += total_material_num * proliferator_price[proliferate_num][proliferate];
          }
          else {
            item_graph[item]["material"][proliferate] = total_material_num * proliferator_price[proliferate_num][proliferate];
          }
        }
        item_graph[item]["output-ratio"] *= game_data.proliferate_effect[proliferate_num]["speedup"];
      } else if (proliferate_mode == 4) {
        for (const proliferate in proliferator_price[proliferate_num]) {
          if (proliferate in item_graph[item]["material"]) {
            item_graph[item]["material"][proliferate] += total_material_num * proliferator_price[proliferate_num][proliferate];
          }
          else {
            item_graph[item]["material"][proliferate] = total_material_num * proliferator_price[proliferate_num][proliferate];
          }
        }
        produce_rate *= game_data.proliferate_effect[proliferate_num]["speedup"];

        item_graph[item]["output-ratio"] *= produce_rate;
      }//接收站透镜喷涂效果，按speedup计算额外产出
    }//计算增产剂效果带来的变化

    for (const material in item_graph[item]["material"]) {
      item_graph[item]["material"][material] /= produce_rate;
    }

    item_graph[item]["output-ratio"] /= game_data.recipe_data[recipe_id]["time"];

    if (item in item_graph[item]["material"]) {
      var self_used = 1 / (1 - item_graph[item]["material"][item]);

      item_graph[item]["output-ratio"] /= self_used;
      item_graph[item]["自消耗"] = self_used - 1;
      delete item_graph[item]["material"][item];
      for (const material in item_graph[item]["material"]) {
        item_graph[item]["material"][material] *= self_used;
      }
    }

    for (const material in item_graph[item]["material"]) {
      if (item_graph[material] === undefined) {
        debugger
      }
      item_graph[material]["is-production"][item] = 1 / item_graph[item]["material"][material];
    }

    if (Object.keys(game_data.recipe_data[recipe_id]["product"]).length > 1) {
      var self_cost = 0;
      if ("自消耗" in item_graph[item]) {
        self_cost = item_graph[item]["自消耗"];
      }


      for (const product in game_data.recipe_data[recipe_id]["product"]) {
        if (product != item) {
          if (product in item_graph[item]["material"]) {
            if (Math.min(game_data.recipe_data[recipe_id]["product"][product] / (game_data.recipe_data[recipe_id]["product"][item] - self_cost), item_graph[item]["material"][product]) == item_graph[item]["material"][product]) {
              item_graph[item]["by-product"][product] = game_data.recipe_data[recipe_id]["product"][product] / (game_data.recipe_data[recipe_id]["product"][item] - self_cost) - item_graph[item]["material"][product];
              item_graph[item]["material"][product] = 0;
              34
              if (product in side_item_dict) {
                side_item_dict[product][item] = 0;
              } else {
                side_item_dict[product] = {};
                side_item_dict[product][item] = 0;
              }
              if (product in multi_sources) {
                multi_sources[product].push(item);
              } else {
                multi_sources[product] = [item];
              }
            } else {
              item_graph[item]["material"][product] -= game_data.recipe_data[recipe_id]["product"][product] / (game_data.recipe_data[recipe_id]["product"][item] - self_cost);
            }
          } else {
            item_graph[item]["by-product"][product] = game_data.recipe_data[recipe_id]["product"][product] / (game_data.recipe_data[recipe_id]["product"][item] - self_cost);
            if (product in side_item_dict) {
              side_item_dict[product][item] = 0;
            } else {
              side_item_dict[product] = {};
              side_item_dict[product][item] = 0;
            }
            if (product in multi_sources) {
              multi_sources[product].push(item);
            } else {
              multi_sources[product] = [item];
            }
          }
        }
      }

    }//此配方有自身无法消耗的by-product --副产物时

    var factory_type = game_data.recipe_data[recipe_id]['facility'];
    var building_info = game_data.factory_data[factory_type][scheme_data.scheme_for_recipe[recipe_id]["architecture"]];
    if (factory_type == "采矿设备" || factory_type == "抽水设备" || factory_type == "抽油设备" || factory_type == "orbital_collector") {
      item_graph[item]["output-ratio"] *= scheme_data.mining_rate["科技面板倍率"];
      if (building_info["名称"] == "mining_drill") {
        item_graph[item]["output-ratio"] *= scheme_data.mining_rate["小矿机覆盖矿脉数"];
      }
      else if (building_info["名称"] == "mining_drill_mk2") {
        item_graph[item]["output-ratio"] *= (scheme_data.mining_rate["大矿机覆盖矿脉数"] * scheme_data.mining_rate["大矿机工作倍率"]);
      }
      else if (building_info["名称"] == "oil_extractor") {
        item_graph[item]["output-ratio"] *= scheme_data.mining_rate["油井期望面板"];
      }
      else if (building_info["名称"] == "orbital_collector") {
        if (item == "hydrogen") {
          //氢
          item_graph[item]["output-ratio"] *= scheme_data.mining_rate["巨星氢面板"];
        }
        else if (item == "deuterium") {
          //重氢
          item_graph[item]["output-ratio"] *= scheme_data.mining_rate["巨星重氢面板"];
        }
        else if (item == "gas_hydrate") {
          //可燃冰
          item_graph[item]["output-ratio"] *= scheme_data.mining_rate["巨星可燃冰面板"];
        }
      }
    }//采矿设备需算上科技加成
    else if (factory_type == "分馏设备") {
      if (building_info["名称"] == "fractionator") {
        item_graph[item]["output-ratio"] *= scheme_data.fractionating_speed / 60;
      }
    }
    else if (factory_type == "轻型工业机甲") {
      if (building_info["名称"] == "伊卡洛斯") {
        item_graph[item]["output-ratio"] *= scheme_data.mining_rate["伊卡洛斯手速"];
      }
    }//毫无意义，只是我想这么干
  }
  return item_graph;
}//根据配方设定完善产物关系图与多来源产物表


function build_item_list() {

  function delete_item_from_product_graph(name) {
    for (const item in product_graph[name]["material"]) {
      delete product_graph[item]["is-production"][name];
    }

    for (const item in product_graph[name]["is-production"]) {
      delete product_graph[item]["material"][name];
    }
    delete product_graph[name];
  }
  function find_item(name, isProduction, P_item_list) {
    if (!isProduction) {
      if (product_graph[name] && Object.keys(product_graph[name]["material"]).length == 0) {
        var production = product_graph[name]["is-production"];
        delete_item_from_product_graph(name);
        item_list[P_item_list[0]] = name;
        item_data[name][0] = P_item_list[0];
        P_item_list[0] += 1;
        for (let item in production) {
          P_item_list = find_item(item, 0, P_item_list);
        }
      }
    }
    else {
      if (product_graph[name] && Object.keys(product_graph[name]["is-production"]).length == 0) {
        var material = product_graph[name]["material"];
        delete_item_from_product_graph(name);
        item_list[P_item_list[1]] = name;
        item_data[name][0] = P_item_list[1];
        P_item_list[1] -= 1;
        for (let item in material) {
          P_item_list = find_item(item, 1, P_item_list);
        }
      }
    }//函数find_item用于迭代寻找产物关系图中的出度或入度为0的点，并将其从关系图中删去，存入物品列表中
    return P_item_list;
  }
  var product_graph = JSON.parse(JSON.stringify(item_graph));
  item_list = [];
  key_item_list = [];
  var P_item_list = [0, Object.keys(product_graph).length - 1];
  while (1) {
    for (var this_item in product_graph) {
      if (this_item in product_graph) {
        if (Object.keys(product_graph[this_item]["material"]).length == 0) {
          P_item_list = find_item(this_item, 0, P_item_list);
        }
        else if (Object.keys(product_graph[this_item]["is-production"]).length == 0) {
          P_item_list = find_item(this_item, 1, P_item_list);
        }
      }
    }
    if (Object.keys(product_graph).length <= 0) break;
    var key_item = { "name": -1, "count": 1 };//记录关键物品的名字与出入度只和的最大值
    var count;
    for (var this_item in product_graph) {
      count = Object.keys(product_graph[this_item]["material"]).length + Object.keys(product_graph[this_item]["is-production"]).length
      if (count > key_item["count"]) {
        key_item["name"] = this_item;
        key_item["count"] = count;
      }
    }
    key_item_list.push(key_item["name"]);
    item_list[P_item_list[0]] = key_item["name"];
    item_data[key_item["name"]][0] = P_item_list[0];
    P_item_list[0]++;
    delete_item_from_product_graph(key_item["name"]);
  }//在物品图中找出循环关键物品，并将物品按生产层级由低到高排列
  return item_list
}//根据物品关系图生成物品列表，物品列表在将关键产物原矿化的情况下某物品的左侧的物品必不可能是其下游产物，右侧的物品必不可能是其上游产物，从做往右迭代一次就是将整个生产线从上游往下游迭代一次


function get_item_price() {
  var p_key_item = 0;
  // var item_price = {};
  function count_total_material(dict, material, num) {
    if (material in dict) {
      dict[material] = Number(dict[material]) + num;
    } else {
      dict[material] = num;
    }

    for (var sub_material in item_price[material]["material"]) {
      if (sub_material in dict) {
        dict[sub_material] = Number(dict[sub_material]) + item_price[material]["material"][sub_material] * num;
      }
      else {
        dict[sub_material] = item_price[material]["material"][sub_material] * num;
      }
    }
    return dict;
  }
  for (var i = 0; i < item_list.length; i++) {
    if (p_key_item < key_item_list.length && item_list[i] == key_item_list[p_key_item]) {
      item_price[item_list[i]] = { "material": {}, "成本": 0 };
      ++p_key_item;
    }
    else if ((item_list[i] in multi_sources) || (item_list[i] in external_supply_item)) {
      item_price[item_list[i]] = { "material": {}, "成本": 0 };
    }
    else {
      item_price[item_list[i]] = { "material": {}, "成本": get_item_cost(item_list[i]) };
      for (var material in item_graph[item_list[i]]["material"]) {
        item_price[item_list[i]]["material"] = count_total_material(item_price[item_list[i]]["material"], material, item_graph[item_list[i]]["material"][material]);
      }
      if (!scheme_data.cost_weight["additional_cost_of_product"][item_list[i]]["与其它成本累计"]) {
        for (var material in item_graph[item_list[i]]["material"]) {
          item_price[item_list[i]]["成本"] = Number(item_price[item_list[i]]["成本"]) + item_graph[item_list[i]]["material"][material] * item_price[material]["成本"];
        }
      }
    }
  }
  return item_price;
}//取得每一个物品的历史产出


function get_item_cost(item) {
  var cost = 0.0;
  if (scheme_data.cost_weight["additional_cost_of_product"][item]["启用"]) {
    cost = Number(cost) + scheme_data.cost_weight["additional_cost_of_product"][item]["成本"];
    if (!scheme_data.cost_weight["additional_cost_of_product"][item]["与其它成本累计"]) {
      return cost;
    }
  }
  let recipe_id = item_data[item][scheme_data.item_recipe_choices[item]];
  var building_info = game_data.factory_data[game_data.recipe_data[recipe_id]["facility"]][scheme_data.scheme_for_recipe[recipe_id]["architecture"]];
  var building_count_per_yield = 1 / item_graph[item]["output-ratio"] / building_info["倍率"];
  var layer_count = 1;
  if (building_info["名称"] in stackable_buildings) {
    layer_count = stackable_buildings[building_info["名称"]];
  }
  cost = Number(cost) + building_count_per_yield * scheme_data.cost_weight["占地"] * building_info["占地"] / layer_count;//计算占地造成的成本=单位产能建筑数*占地成本权重*建筑占地
  cost = Number(cost) + building_count_per_yield * scheme_data.cost_weight["电力"] * building_info["耗能"] * game_data.proliferate_effect[scheme_data.scheme_for_recipe[recipe_id]["additional_level"]]["power-ratio"];
  //计算耗电造成的成本 = 单位产能建筑数 * 耗电成本权重 * 建筑耗电 * 喷涂影响
  cost = Number(cost) + building_count_per_yield * (0 * scheme_data.cost_weight["construction_cost"]["分拣器"] / layer_count + scheme_data.cost_weight["construction_cost"][building_info["名称"]]);
  //建筑产生的成本 = 单位产能建筑数*(每个结构中分拣器数量*分拣器成本 + 生产construction_cost 建筑成本)，分拣器成本那块，说是分拣器，但实际上可以是任何一个针对各种配方独立成本的系数
  return cost;
}//计算一个物品的成本，用于各种各样的线性规划



function get_linear_programming_list() {
  var model = {
    optimize: 'cost',
    opType: 'min',
    constraints: {},
    variables: {}
  }//创建求解模型
  for (var item in lp_item_dict) {
    model.constraints["i" + item] = { min: lp_item_dict[item] };
    model.variables[item] = { cost: get_item_cost(item) };
    for (var other_item in lp_item_dict) {
      model.variables[item]["i" + other_item] = 0.0;
    }
    model.variables[item]["i" + item] = 1.0;
    if ("by-product" in item_graph[item]) {
      for (var sub_product in item_graph[item]["by-product"]) {
        model.variables[item]["i" + sub_product] = Number(model.variables[item]["i" + sub_product]) + item_graph[item]["by-product"][sub_product];
      }
    }
    for (var material in item_graph[item]["material"]) {
      if (!scheme_data.cost_weight["additional_cost_of_product"][item]["与其它成本累计"]) {
        model.variables[item].cost = Number(model.variables[item].cost) + item_graph[item]["material"][material] * item_price[material]["成本"];//配方成本加上原料的成本
      }
      if (material in lp_item_dict) {
        model.variables[item]["i" + material] = Number(model.variables[item]["i" + material]) - item_graph[item]["material"][material];
      }
      if ("by-product" in item_graph[material] && !(material in lp_item_dict)) {//遍历原料时，如果原料时线规相关物品那么将其视作原矿，不考虑生产时的by-product
        for (var sub_product in item_graph[material]["by-product"]) {
          model.variables[item]["i" + sub_product] = Number(model.variables[item]["i" + sub_product]) + item_graph[material]["by-product"][sub_product] * item_graph[item]["material"][material];
        }
      }
      for (var sub_item in item_price[material]["material"]) {
        if (sub_item in lp_item_dict) {
          model.variables[item]["i" + sub_item] = Number(model.variables[item]["i" + sub_item]) - item_price[material]["material"][sub_item] * item_graph[item]["material"][material];
        }
        if ("by-product" in item_graph[sub_item] && !(sub_item in lp_item_dict)) {//遍历原料时，如果原料是线规相关物品那么将其视作原矿，不考虑生产时的by-product
          for (var sub_product in item_graph[sub_item]["by-product"]) {
            model.variables[item]["i" + sub_product] = Number(model.variables[item]["i" + sub_product]) + item_graph[sub_item]["by-product"][sub_product] * item_graph[item]["material"][material] * item_price[material]["material"][sub_item];
          }//否则生产这个配方时，其原料带来的必要by-product为：配方的此原料数*此原料成本中该物品的数量*单个该物品造成的by-product产出
        }
      }
    }
  }//完善求解器输入的模型
  var results = solver.Solve(model);
  //求解线性规划，解得满足需求时每个item对应的item_graph的执行次数
  var lp_cost = 0;
  if ("result" in results) {
    lp_cost = results["result"];
    delete results["result"];
  }//记录线规目标函数结果
  if ("feasible" in results) {
    if (!results.feasible) {
      alert("线性规划无解,请检查来源配方设定是否可能满足需求");
    }
    delete results.feasible;
  }//无解判断
  if ("bounded") {
    if (!results.bounded) {
      alert("线性规划目标函数无界,请检查配方执行成本是否合理");
    }
    delete results.bounded;
  }//无界判断
  var lp_products = {};
  for (var item in model.constraints) {
    lp_products[item] = (-1) * model.constraints[item]["min"];
  }//记录多余物品，如果是缺失物品为负
  for (var recipe in results) {
    for (var item in model.variables[recipe]) {
      if (item != "cost") {
        lp_products[item] += model.variables[recipe][item] * results[recipe];
      }
    }
  }//对线规结果执行相应配方增减相应物品
  for (var item in lp_products) {
    if (lp_products[item] > 1e-8) {//倘若最后物品仍有多余，则输出至多余物品表
      lp_surplus_list[item.slice(1)] = lp_products[item];
    }
  }//多余物品计算
  for (var item in lp_item_dict) {
    result_dict[item] = 0;//将原矿化过的线规相关物品置为0，之后用线规结果的历史产出填补
  }
  for (var item in results) {
    result_dict[item] = Number(result_dict[item]) + results[item];
    for (var material in item_graph[item]["material"]) {
      if (!(material in lp_item_dict)) {
        if (material in result_dict) {
          result_dict[material] = Number(result_dict[material]) + results[item] * item_graph[item]["material"][material];
        }
        else {
          result_dict[material] = results[item] * item_graph[item]["material"][material];
        }
        for (var sub_material in item_price[material]["material"]) {
          if (!(sub_material in lp_item_dict)) {
            if (sub_material in result_dict) {
              result_dict[sub_material] = Number(result_dict[sub_material]) + results[item] * item_graph[item]["material"][material] * item_price[material]["material"][sub_material];
            }
            else {
              result_dict[sub_material] = results[item] * item_graph[item]["material"][material] * item_price[material]["material"][sub_material];
            }
          }
        }
      }
    }
  }//线规相关物品的总产出计算
  /*
      先根据result和model.variables中的各个消耗生成相乘后相加，减去constraints得到溢出物品，就是最终的多余产物 √
      然后将result_dict中线规物品矿的总吞吐量置为0，后遍历item_graph中各result中item的原料，不考虑制造过程中消耗的线规相关物品矿 √
      亦不考虑非线规相关物品提供的by-product(这会导致可能迭代下来获得的某一多来源物品的总计历史产出低于线规需求，不过这一部分非线规物品的副产品贡献会在之后展示result_dict时体现) √
      将得到的历史总产出加在result_dict中，此时得到了一个完全忽略所有副产出的result_dict实际上代表的是每个item按其item_graph执行的次数
      再在考虑显示result_dict的时候将净产出化为毛产出，并在括号内注明其余来源的产物即可
  */

  return lp_cost;//返回求解器求解结果
}//线性规划


//计算所需的设备列表
function show_result_dict() {
  // var str = "";
  energy_cost = 0;
  building_list = {};
  function get_factory_number(amount, item) {
    let recipe_id = item_data[item][scheme_data.item_recipe_choices[item]];
    var scheme_for_recipe = scheme_data.scheme_for_recipe[recipe_id];
    var factory_per_yield = 1 / item_graph[item]["output-ratio"] / game_data.factory_data[game_data.recipe_data[recipe_id]["facility"]][scheme_for_recipe["architecture"]]["倍率"];

    var offset = 0;
    offset = 0.49994 * 0.1 ** fixed_num;//未显示的部分进一法取整
    var build_number = amount / 60 * factory_per_yield + offset;
    if (Math.ceil(build_number - 0.5 * 0.1 ** fixed_num) != 0) {
      if (game_data.factory_data[game_data.recipe_data[recipe_id]["facility"]][scheme_for_recipe["architecture"]]["名称"] in building_list) {
        building_list[game_data.factory_data[game_data.recipe_data[recipe_id]["facility"]][scheme_for_recipe["architecture"]]["名称"]] = Number(building_list[game_data.factory_data[game_data.recipe_data[recipe_id]["facility"]][scheme_for_recipe["architecture"]]["名称"]]) + Math.ceil(build_number - 0.5 * 0.1 ** fixed_num);
      }
      else {
        building_list[game_data.factory_data[game_data.recipe_data[recipe_id]["facility"]][scheme_for_recipe["architecture"]]["名称"]] = Math.ceil(build_number - 0.5 * 0.1 ** fixed_num);
      }
    }
    game_data.factory_data[""]
    var factory = game_data.recipe_data[recipe_id]["facility"];
    if (factory != "巨星采集" && !(!scheme_data.energy_contain_miner && (factory == "采矿设备" || factory == "抽水设备" || factory == "抽油设备"))) {
      var e_cost = build_number * game_data.factory_data[game_data.recipe_data[recipe_id]["facility"]][scheme_for_recipe["architecture"]]["耗能"];
      if (game_data.factory_data[game_data.recipe_data[recipe_id]["facility"]][scheme_for_recipe["architecture"]]["名称"] == "大型采矿机") {
        e_cost = scheme_data.mining_rate["大矿机工作倍率"] * scheme_data.mining_rate["大矿机工作倍率"] * (2.94 - 0.168) + 0.168;
      }
      if (scheme_for_recipe["additional_mode"] != 0 && scheme_for_recipe["additional_level"] != 0) {
        e_cost *= game_data.proliferate_effect[scheme_for_recipe["additional_level"]]["power-ratio"];
      }
      energy_cost = Number(energy_cost) + e_cost;
    }
    return build_number;
  }
  function is_mineralized(item) {
    if (item in mineralize_list) {
      return "(原矿化)";
    }
    else {
      return "";
    }
  }
  function get_gross_output(amount, item) {
    var offset = 0;
    offset = 0.49994 * 0.1 ** fixed_num;//未显示的部分进一法取整
    if (item_graph[item]["自消耗"]) {
      return Number(amount * (1 + item_graph[item]["自消耗"])) + offset;
    }
    return Number(amount) + offset;
  }

  function add_side_products_in_other_row(item) {
    var item_num = result_dict[item];
    console.log("item_num", item_num);
    for (var side_products in item_graph[item]["by-product"]) {
      if (excessProduct[side_products] == undefined) {
        excessProduct[side_products] = {}
      }
      excessProduct[side_products][item] = item_num * item_graph[item]["by-product"][side_products]
      total_item_dict[side_products] += item_num * item_graph[item]["by-product"][side_products];
    }
  }


  list_data = []
  for (var i in result_dict) {
    var recipe_id = item_data[i][scheme_data.item_recipe_choices[i]];

    var factory_number
    if (i in mineralize_list) {
      factory_number = 0
    } else {
      factory_number = get_factory_number(result_dict[i], i).toFixed(fixed_num);
    }

    list_data.push(
      {
        key: i,
        efficiency: get_gross_output(result_dict[i], i).toFixed(fixed_num),
        // 文字形式
        // factoriesNum: `${DSP[game_data.factory_data[game_data.recipe_data[recipe_id]["facility"]][scheme_data.scheme_for_recipe[recipe_id]["architecture"]]["名称"]].name} * ${factory_number + is_mineralized(i)}`,
        //图片形式
        factoriesNum: {
          key: game_data.factory_data[game_data.recipe_data[recipe_id]["facility"]][scheme_data.scheme_for_recipe[recipe_id]["architecture"]]["名称"],
          num: factory_number + is_mineralized(i),
          is_mineralized: is_mineralized(i) === "(原矿化)"
        }
      }
    )

    // str += "<tr id=\"row_of_" + i + "\"><th><a href=\"Javascript:mineralize('" + i + "')\">视为原矿</a></th>" + //操作
    //   "<th>" + "<img src=\"./image/" + i + ".png\" title=\"" + i + "\" style=\"width: 40px; height: 40px;\">" + "</th>" +  //目标物品
    //   "<th id=\"num_of_" + i + "\">" + get_gross_output(result_dict[i], i).toFixed(fixed_num) + "</th>" +  //分钟毛产出
    //   "<th><p id=\"factory_counts_of_" + i + "\" value=\"" + factory_number + "\">" + game_data.factory_data[game_data.recipe_data[recipe_id]["facility"]][scheme_data.scheme_for_recipe[recipe_id]["architecture"]]["名称"] +
    //   " * " + factory_number + is_mineralized(i) + "</p></th>" +  //所需工厂*数目
    //   "<th><select id=\"recipe_for_" + i + "\" onChange=\"c('" + i + "')\"></select></th>" + // 所选配方
    //   "<th><select id=\"pro_num_for_" + i + "\" onChange=\"ChangeSchemeOf('" + i + "')\"></select></th>" + //所选增产剂
    //   "<th><select id=\"pro_mode_for_" + i + "\" onChange=\"ChangeSchemeOf('" + i + "')\"></select></th>" + //所选additional_mode
    //   "<th><select id=\"factory_for_" + i + "\" onChange=\"ChangeSchemeOf('" + i + "')\"></select></th></tr>";//所选工厂种类
  }

  var total_item_dict = JSON.parse(JSON.stringify(result_dict));
  for (var i in result_dict) {
    change_result_row_for_item(i);
    add_side_products_in_other_row(i);
  }
  // for (var i in total_item_dict) {
  //   if (total_item_dict[i] < 1e-6) {
  //     // document.getElementById("row_of_" + i).remove();
  //   }
  // }
  for (var NPId in natural_production_line) {
    var recipe = game_data.recipe_data[item_data[natural_production_line[NPId]["目标物品"]][natural_production_line[NPId]["recipe_id"]]];
    var building = game_data.factory_data[recipe["facility"]][natural_production_line[NPId]["architecture"]];
    if (building in building_list) {
      building_list[building["名称"]] = Number(building_list[building["名称"]]) + Math.ceil(natural_production_line[NPId]["建筑数量"]);
    }
    else {
      building_list[building["名称"]] = Math.ceil(natural_production_line[NPId]["建筑数量"]);
    }
    if (recipe["facility"] != "巨星采集" && !(!scheme_data.energy_contain_miner && (recipe["facility"] == "采矿设备" || recipe["facility"] == "抽水设备" || recipe["facility"] == "抽油设备"))) {
      var e_cost = natural_production_line[NPId]["建筑数量"] * building["耗能"];
      if (natural_production_line[NPId]["additional_level"] != 0 && natural_production_line[NPId]["additional_mode"] != 0) {
        e_cost *= game_data.proliferate_effect[natural_production_line[NPId]["additional_level"]]["power-ratio"];
      }
      energy_cost = Number(energy_cost) + e_cost;
    }
  }
  var building_str = "";
  for (var building in building_list) {
    building_str += building + ":" + building_list[building] + "</br>";
  }

}//展示结果

function change_result_row_for_item(item) {

  let optionDEF = {
    label: "",
    selected: ""
  }

  for (var i = 1; i < item_data[item].length; i++) {
    optionDEF.label = recipe_lists[item_data[item][i]];
    if (scheme_data.item_recipe_choices[item] == i) {
      optionDEF.selected = "selected";
    }
  }
}//根据物品当前生产策略调整输出栏

function init_recipe_list() {
  const recipe_list = []
  for (var i = 0; i < game_data.recipe_data.length; i++) {
    recipe_list.push(recipe_to_html(game_data.recipe_data[i]))
  }
  return recipe_list
}//初始化配方选取列表

function recipe_to_html(recipe) {
  let trick = {
    in: {},
    out: {},
    time: 0,
    facility: ""
  }
  for (var material in recipe["material"]) {
    trick.in[material] = recipe["material"][material]
  }
  for (var products in recipe["product"]) {
    trick.out[products] = recipe["product"][products]
  }
  trick.time = recipe["time"]
  trick.facility = recipe["facility"]
  return trick;
}//配方选项的展示格式，有空把它换成图形界面



export const get_item_recipe_choices = (key) => {

  let recipe_id = item_data[key][scheme_data.item_recipe_choices[key]];
  const additional_level = scheme_data.scheme_for_recipe[recipe_id]["additional_level"]
  const additional_mode = scheme_data.scheme_for_recipe[recipe_id]["additional_mode"]
  const architecture = scheme_data.scheme_for_recipe[recipe_id]["architecture"]
  const additional_mode_index = scheme_data.scheme_for_recipe[recipe_id]["additional_mode_index"]
  return {
    additional_level,
    additional_mode,
    architecture,
    additional_mode_index,
  }
}
export const set_item_recipe_choices = (key, type, index) => {
  let recipe_id = item_data[key][scheme_data.item_recipe_choices[key]];
  const types = ["additional_level", "additional_mode", "architecture", "additional_mode_index"]
  if (types.indexOf(type) !== -1) {
    scheme_data.scheme_for_recipe[recipe_id][type] = index
  }
}

// 获取单个配置数据
export const get_one_item_recipe_choices = (key, type, index) => {
  // 修改单个配置数据
  let recipe_id = item_data[key][scheme_data.item_recipe_choices[key]];
  const types = ["additional_level", "additional_mode", "architecture", "additional_mode_index"]
  if (types.indexOf(type) !== -1) {
    return scheme_data.scheme_for_recipe[recipe_id][type]
  } else {
    console.error("未找到传入的类型数据，请确认传入是否正确")
    return ""
  }
}
export const change_recipe_of = (key, index) => {
  scheme_data.item_recipe_choices[key] = index
  let recipe_id = item_data[key][scheme_data.item_recipe_choices[key]];
  scheme_data.scheme_for_recipe[recipe_id]["additional_mode_index"] = game_data.recipe_data[recipe_id]["additional_mode"]
}//切换物品来源配方


function initDate() {
  //初始化默认喷涂机的模式
  // let recipe_id = item_data["e_matrix"][scheme_data.item_recipe_choices["e_matrix"]];
  for (const key in scheme_data.item_recipe_choices) {
    let recipe_id = item_data[key][scheme_data.item_recipe_choices[key]];
    scheme_data.scheme_for_recipe[recipe_id]["additional_mode_index"] = game_data.recipe_data[recipe_id]["additional_mode"]
    scheme_data.scheme_for_recipe[recipe_id]["additional_mode"] = 0
  }
}

export const batchChangeProMode = (pro_mode) => {
  for (var i = 0; i < game_data.recipe_data.length; i++) {
    if (pro_mode != 0 && !(pro_mode & game_data.recipe_data[i]["additional_mode"])) {
      continue;
    }
    scheme_data.scheme_for_recipe[i]["additional_mode"] = Number(pro_mode);
  }
}//批量更改增产剂使用模式

export const batchChangeProNum = (pro_num) => {
  for (var i = 0; i < game_data.recipe_data.length; i++) {
    scheme_data.scheme_for_recipe[i]["additional_level"] = pro_num;
  }
}//批量更改配方使用的增产剂的等级


export const batchChangeFactoryOf = (factory, building) => {
  for (var i = 0; i < game_data.recipe_data.length; i++) {
    if (game_data.recipe_data[i]["facility"] == factory) {
      scheme_data.scheme_for_recipe[i]["architecture"] = building;
    }
  }
}//批量改变某一类型建筑的等级


export const mineralize = (item) => {
  console.log("mineralize_list", mineralize_list);
  console.log("item_graph", item_graph);
  mineralize_list[item] = JSON.parse(JSON.stringify(item_graph[item]));
  item_graph[item]["material"] = {};
  console.log("删除之后？？？", item_graph[item]);
}//原矿化物品

export const unMineralize = (item) => {
  console.log("mineralize_list", mineralize_list);
  item_graph[item] = JSON.parse(JSON.stringify(mineralize_list[item]));
  delete mineralize_list[item];
}//取消原矿化
