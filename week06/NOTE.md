# 每周总结可以写在这里
+ 重新css计算必然造成重排，重排必然造成重绘。所以style越靠前越好。
+ div div #myid一定是从后往前匹配的。匹配到了#myid后 再往前找是否有两个div。最后一个配置项必须匹配当前元素。
+ style属性不参加重新计算
+ inherit会在使用的时候在确定值
+ 修改css的rule 会导致大规模的css重新计算，修改style和class属性更符合逻辑。
+ css computing耗时非常少，可忽略。
+ react没有css computing阶段，因为全是行内样式。
