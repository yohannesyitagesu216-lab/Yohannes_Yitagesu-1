import os,numpy as np,tensorflow as tf
from sklearn.metrics import classification_report,confusion_matrix
if not os.path.exists("models/agrovision_model.keras"):raise SystemExit("Run train.py first.")
m=tf.keras.models.load_model("models/agrovision_model.keras")
ds=tf.keras.utils.image_dataset_from_directory("dataset/train",image_size=(224,224),batch_size=32,label_mode="categorical",validation_split=.2,subset="validation",seed=42,shuffle=False)
yt=[];yp=[]
for x,y in ds: yt+=list(np.argmax(y.numpy(),1));yp+=list(np.argmax(m.predict(x,verbose=0),1))
print(classification_report(
    yt,
    yp,
    labels=range(len(ds.class_names)),
    target_names=ds.class_names,
    digits=4,
    zero_division=0
))
