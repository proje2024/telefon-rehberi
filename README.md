# **Telefon Rehberi**

**Telefon Rehberi**; şirket içerisindeki pozisyonların ve şirket hiyerarşisinin görüntülenebildiği bir uygulamadır. Bu uygulamada yer alan admin ve user rolleri ile farklı işlemler yapılabilmektedir. Admin panelde şirket pozisyonları güncellenebilir, pozisyon bilgisinin kullanıcıya görünüp olup olmayacağı seçilebilir ve abonelik türü işlemleri gerçekleştirilebilir.

Sayfasının sol tarafında yer alan ağaçtan şirket içerisindeki pozisyonlar listelenmektedir. Ağacın üst kısmında bulunan arama çubuğu sayesinde pozisyon isminde arama yapabilirsiniz. Görüntülemek istediğiniz pozisyona tıkladığınızda sağ taraftaki panelde pozisyon bilgileri detaylı bir şekilde görüntülenir. Pozisyonların Adı, Sabit Numara ,IP Numara , Posta Kutusu , Görünürlük , Yeni Alan , Abonelik Türü bilgileri sistemde yer almaktadır, bu bilgilerd dinamik olarak tasarlanmış ve telefon-rehberi/frontend/.env dosyası üzerinden değişkenleri değiştirerek verilen isim değiştirilebilir durumdadır. Admin panelinde yer alan "Güncelle" butonu ile açılan form üzerinden pozisyonunun bilgilerini güncelleyebilirsiniz. Görünürlük checkboxı seçildiğinde pozisyon "Görünür" duruma gelir , eğer checkbox işaretlenmezse pozisyon "Gizli" durumuna gelir. Gizli durumundaki pozisyonlar user panelde listelenmez.

Sayfanın sağ üstünde yer alan "Veritabanını Yedekle" ve "Veritabanını Geri Yükle" butonları ile veraitabanının backup'ını alıp restore edebilirsiniz. Admin panelde yer alan "Abonelik Yönetimi" butonu ile birlikte abonelik türlerinin ekleme, güncelleme ve silme işlemlerini gerçekleştirebilirsiniz.

Projede backup mekanizması bulunmaktadır. Her gün sistemin backup dosyası alınmaktadır. 7 gün öncesine ait backup dosyaları da silinmektedir. backend/api/db/backup_db.py yolundaki backup_db.py dosyasından bu mekanizmayı inceleyebilirsiniz.

## Kurulum

telefon-rehberi/frontend/env dosyası içerisinde yer alan değişkenleri kullanmak istediğiniz değişken adına göre değiştirebilirsiniz.

telefon-rehberi/.env dosyasındaki SERVICE_URL ifadesini verileri alacağınız servisin urli ile değiştirilmesi gerekmektedir,
"telefon-rehberi" klasörünün içerisinde `docker compose up --build` komutunu çalıştırınız.

Tarayıcınızdan "http://localhost:FRONTEND_HOST/login" adresine gidin. Açılan login sayfasında admin olarak giriş yapmak istenildiğinde kullanıcı adı "admin" , şifre "12345678" olacak şekilde bilgileri ile admin olarak giriş yapabilirsiniz. Kullanıcı olarak giriş yapmak istediğinizde ise kullanıcı oluşturarak giriş yapabilirsiniz.

Kurulum tamamlandığında "Abonelik Yönetimi" sayfasında default oluşturulmuş abonelik türleri listelenecektir. Bu alanları güncelleyebilir, silebilir veya yeni bir tür ekleyebilirsiniz.

Kurulum sırasında servisten okunup veritabanına kaydedilen pozisyon bilgilerine default olarak abonelik türü "1"(substype1) ve görünürlük bilgisi "Görünür" olarak insert edilmektedir.

## Dikkat Edilmesi Gerekenler

Pozisyonlara abonelik türü olarak default 1 (substype1) atandığı için abonelik yönetimi sayfasından bu abonelik türünün silinmemesi gerekmetedir. güncelleyerek ismini değiştirilebilir ve kullanıma devam edilebilir ya da kullanmak istediğiniz abonelik türü sisteme eklendikten sonra, abonelik türü "substype1" olan pozisyon bilgileri değiştirilerek kaydedilir daha sonrasında bu abonelik türü silinebilir. Bu şekilde abonelik türü yönetimini sağlayabilirsiniz.

telefon-rehberi/.env dosyasındaki SERVICE_URL ifadesini pozisyon bilgilerini alacağınız url adresi ile değiştirildiğinden emin olunuz. Gelen veri formatı aşağıdaki gibi olmalıdır. telefon-rehberi/service/app.py dosyasından verilerin serviceden alınıp veritabanına yazılma işlemleri gerçekleşmektedir.

[
{
"ad": "CEO",
"ataId": null,
"hiyerAd": "CEO",
"hiyerId": "1",
"id": 1
},
{
"ad": "CFO",
"ataId": 1,
"hiyerAd": "CEO/CFO",
"hiyerId": "1.1",
"id": 2
},
{
"ad": "CTO",
"ataId": 1,
"hiyerAd": "CEO/CTO",
"hiyerId": "1.2",
"id": 3
}
]

minikube start --driver=kvm2

eval $(minikube -p minikube docker-env)

docker build -t rehber-backend:v.10.09.24.1 -f ./backend/Dockerfile .

docker build -t rehber-frontend:v.10.09.24.1 -f ./frontend/Dockerfile .

docker build -t rehber-service:v.10.09.24.1 -f ./service/Dockerfile .

docker save rehber-backend:v.10.09.24.1 | (eval $(minikube docker-env) && docker load)
docker save rehber-frontend:v.10.09.24.1 | (eval $(minikube docker-env) && docker load)
docker save rehber-service:v.10.09.24.1 | (eval $(minikube docker-env) && docker load)

export $(cat kubernetes/backend/.env | xargs) # Ortam değişkenlerini yükleyin
envsubst < kubernetes/backend/backend-pvc.yaml | kubectl apply -f -
envsubst < kubernetes/backend/backend-deployment.yaml | kubectl apply -f -
envsubst < kubernetes/backend/backend-service.yaml | kubectl apply -f -

export $(cat kubernetes/frontend/.env | xargs) # Ortam değişkenlerini yükleyin
envsubst < kubernetes/frontend/frontend-deployment.yaml | kubectl apply -f -
envsubst < kubernetes/frontend/frontend-service.yaml | kubectl apply -f -

export $(cat kubernetes/data/.env | xargs) # Ortam değişkenlerini yükleyin
envsubst < kubernetes/data/data-deployment.yaml | kubectl apply -f -
envsubst < kubernetes/data/data-service.yaml | kubectl apply -f -


kubectl get pods
minikube ip

tüm deployment, service, pvc silmek için ayrı ayrı aşağıdakileri çalıştırabilirsin:


kubectl delete deployment --all
kubectl delete service --all
kubectl delete pvc --all
aşağıdaki gibi tek tek silebilirsin

kubectl delete deployment [deployment ismi]
kubectl delete service [service ismi]
kubectl delete pvc [pvc ismi]

örnek:
kubectl delete deployment frontend-deployment
kubectl delete service frontend-service