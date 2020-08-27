import Sprite = Laya.Sprite;
import GameConfig from "../../GameConfig";
import Point = Laya.Point;

export default class GridHelper {
    public static getGridMap(areas: Sprite[] = null, isWalkableArea: boolean, gridSize: number, container?: Sprite): number[][] {
        let column: number = ((container ? container.width : GameConfig.width) / gridSize) ^ 0; // ^0 取整
        let row: number = ((container ? container.height : GameConfig.height) / gridSize) ^ 0; // ^0 取整
        let halfGridSize: number = gridSize * 0.5;

        let areaNum: number = areas.length;
        let walkableMap: number[][] = [];
        let testPos:Point = new Point(0,0);
        for (let i: number = 0; i < column; i++) {
            walkableMap[i] = [];
            for (let j: number = 0; j < row; j++) {
                testPos.x = i * gridSize + halfGridSize;
                testPos.y = j * gridSize + halfGridSize;
                if(container){
                    testPos = container.localToGlobal(testPos);
                }

                let walkable: boolean = !isWalkableArea;
                for (let k: number = 0; k < areaNum; k++) {
                    let dobj: Sprite = areas[k];
                    if (dobj.hitTestPoint(testPos.x, testPos.y)) {
                        walkable = isWalkableArea;
                        break;
                    }
                }
                walkableMap[i][j] = walkable ? 0 : 1;
            }
        }
        return walkableMap;
    }
}