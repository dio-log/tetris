// import { BlockManager, Block, PointsProvider, OShape, LShape, TShape, ZShape } from "./block_module/block_manager.js"
import { XY } from "./renderer/type.js";
import { Renderer } from "./renderer/renderer.js";
import { AbDrawable, Shape, Rect, Container } from "./renderer/drawable.js";

const binaryBlocks: Array<BinaryBlock> =
    [
        [//T
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        [//L
            [1, 0, 0],
            [1, 0, 0],
            [1, 1, 0],
        ],
        [//J
            [0, 0, 1],
            [0, 0, 1],
            [0, 1, 1],
        ],
        [//S
            [0, 0, 0],
            [0, 1, 1],
            [1, 1, 0],
        ],
        [//Z
            [0, 0, 0],
            [1, 1, 0],
            [0, 1, 1],
        ],
        [//O
            [1, 1],
            [1, 1],
        ],
        [//I
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ],
    ];



/**
 * @todo 마지막에 board, 일단은 블록의 동작 먼저 완성하기 
 */
class Tetris {
    private _renderer: Renderer;
    private _canvasOptions = {
        size: { width: 400, height: 800 },
        scale: "1"
    };
    private _shapeSize: number = 20;
    private _startPos: { x: number, y: number } = { x: 40, y: 40 }; //시작포인트
    private _curBlock?: Container;
    private _eventListener: Array<Function> = [];
    private _board?: Array<Array<number>>;
    private _lastTimestamp = 0;
    private _interval = 1000; //1초

    /**
     * 
     * @param canvasId 
     * @todo - 초기화하면 캔버스가 그려져야함. 그리고 별도 버튼으로 스타트누르면 스타트메소드 호출하고, 기타 로직다 동작해야함 
     */
    constructor(canvasId: string) {
        this._renderer = new Renderer(canvasId);
        this._initialize();
        this._initializeEventListeners();

        let canvas = document.getElementById(canvasId)! as HTMLCanvasElement;
        canvas.width = this._canvasOptions.size.width;
        canvas.height = this._canvasOptions.size.height;
        canvas.style.scale = this._canvasOptions.scale;

        console.log("Tetris initialized");
    }

    private _initialize() {
        this._startPos = { x: this._canvasOptions.size.width / 2, y: 0 };



    }

    private _initWall(): void {
        let x = this._canvasOptions.size.width / this._shapeSize;
        let y = this._canvasOptions.size.height / this._shapeSize;

        const wall = new Array(y).fill(0).map((value, idx) => {
            if(idx == 0 || idx == y-1){
                new Array(x).fill(2)
            }else{
                new Array(x).fill(0)
            }
        });



    }


    start() {
        this._createBlock();
        this._fallBlock = this._fallBlock.bind(this);
        requestAnimationFrame(this._fallBlock);
    }

    pause() {

    }

    end() {

    }

    /**
     * 
     * @description curBlock의 binBlock을 rotate
     */
    private _rotateBinaryBlock(binBlock: BinaryBlock): BinaryBlock {
        const len = binBlock.length;

        const newBinBlock = new Array(len).fill(0).map(() => new Array(len).fill(0));
        for (let row = 0; row < len; row++) {
            for (let col = 0; col < len; col++) {
                newBinBlock[col][len - 1 - row] = binBlock[row][col];
            }
        }
        return newBinBlock;
    }


    /**
     * @description 블록의 기준 좌표를 변경한다. 회전시 사용 
     * @param block 
     * @returns 
     */
    private _calculatePositionWithBlock(block: Container): Array<XY> {
        const binBlock = block.getProperty("binBlock");
        const blockPos = block.getProperty("position");

        const fixedPosArray = [];

        for (let row = 0; row < binBlock.length; row++) {
            for (let col = 0; col < binBlock[row].length; col++) {
                if (binBlock[row][col]) {
                    const fixedPos = {
                        x: blockPos.x + col * this._shapeSize,
                        y: blockPos.y + row * this._shapeSize
                    };
                    fixedPosArray.push(fixedPos);
                }
            }
        }
        return fixedPosArray;
    }

    /**
  * @todo 현재 블록 좌표, rect 기본사이즈 가져와서 계산해서 curblock에 픽셀좌표 셋
  */
    private _rotateBlock() {
        const curBlock = this._curBlock!;
        const curBinBlock = curBlock.getProperty("binBlock");
        curBlock.setProperty("binBlock", this._rotateBinaryBlock(curBinBlock));

        const blockPos = curBlock.getProperty("position");
        const fixedPosArray = this._calculatePositionWithBlock(curBlock);
        const childrens = curBlock.getChildrens();

        for (let i = 0; i < fixedPosArray.length; i++) {
            let shape = childrens[i];
            shape.setProperty("position", fixedPosArray[i]);
            shape.rotate({
                x: blockPos + this._shapeSize * curBinBlock.length / 2,
                y: blockPos + this._shapeSize * curBinBlock.length / 2
            });
        }
    }

    private _randomBinaryBlock(): BinaryBlock {
        let max = binaryBlocks.length - 1; //나중에 6으로 변경 
        let min = 0;
        min = Math.ceil(min);
        max = Math.floor(max);
        const reandumInt = Math.floor(Math.random() * (max - min + 1)) + min;
        return binaryBlocks[reandumInt];
    }

    private _createBlock() {
        const props: Record<string, any> = {};
        const binBlock = this._randomBinaryBlock();
        props["binBlock"] = binBlock;
        const fixePos = { x: this._startPos.x - this._shapeSize * binBlock.length / 2, y: this._startPos.y }
        props["position"] = fixePos;

        const block = new Container(props);
        const posArray = this._calculatePositionWithBlock(block);

        for (let i = 0; i < posArray.length; i++) {
            const shape = new Rect({ id: "s" + i });
            shape.setProperty("position", posArray[i]);
            block.addShape(shape);
        }

        this._renderer.addContainer(block);
        this._curBlock = block; //바닥에 닿았을때 null 할당 
    }

    private _stepBy(step: XY): void {
        const blockPos = this._curBlock?.getProperty("position");

        this._curBlock?.getChildrens().forEach(children => {
            let pos = children.getProperty("position");
            children.setProperty("position", {
                x: pos.x + this._shapeSize * step.x,
                y: pos.y + this._shapeSize * step.y
            });
        })

        this._curBlock?.setProperty("position", {
            x: blockPos.x + this._shapeSize * step.x,
            y: blockPos.y + this._shapeSize * step.y
        })
    }


    /**
     * 
     * @todo - 상하, 좌우, 회전시 충돌여부 
     */
    private _isConflictWithOtherBlock(): boolean {
        return false;
    }

    /**
     * 
     * @todo - 바닥에 닿았는지 ,이걸 호출한곳에서는 바닥에 닿았으면 새로운 블록을 생성 
     */
    private _isReachedFloor(): boolean {
        return false;
    }


    /**
     * 보드 체크해서 하나의 어레이가 다 1 이면 터침 
     */
    private _removeOneLine() {

    }


    private _fallBlock(timestamp: any) {
        if (this._lastTimestamp == 0) {
            this._lastTimestamp = timestamp;
        }
        const elapsed = timestamp - this._lastTimestamp;

        if (elapsed >= this._interval) {
            this._stepBy({ x: 0, y: 1 })
            this._lastTimestamp = timestamp;
        }

        requestAnimationFrame(this._fallBlock);
    }


    private _initializeEventListeners(): void {
        document.addEventListener("keydown", (e) => {
            e.preventDefault();
            console.log(e.key)
            switch (e.key) {
                case "ArrowRight": this._stepBy({ x: 1, y: 0 }); break;
                case "ArrowLeft": this._stepBy({ x: -1, y: 0 }); break;
                case "ArrowDown": this._stepBy({ x: 0, y: 1 }); break;
                case "ArrowUp": this._rotateBlock(); break;
            }
        })
    }
}


type BinaryBlock = Array<Array<number>>;

export { Tetris };