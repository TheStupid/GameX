package 
{
    import flash.display.*;

    public class BitmapDataInfo extends Object
    {
        private var _bitmapdata:BitmapData;
        private var _x:Number;
        private var _y:Number;

        public function BitmapDataInfo(bitmapData:BitmapData, pivotX:Number, pivotY:Number)
        {
            this._bitmapdata = bitmapData;
            this._x = pivotX;
            this._y = pivotY;
            return;
        }// end function

        public function get bitmapdata() : BitmapData
        {
            return this._bitmapdata;
        }// end function

        public function get y() : int
        {
            return this._y;
        }// end function

        public function get x() : int
        {
            return this._x;
        }// end function

    }
}
