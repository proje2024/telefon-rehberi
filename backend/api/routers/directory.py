from sqlalchemy import Column, null, or_, and_
from fastapi import FastAPI, status, HTTPException, Depends, APIRouter, File, UploadFile
from sqlalchemy.orm import Session, joinedload
from api.deps import get_db, get_current_user
from api.db.models import Directory, SubscriptionTypes, Sub_Directory, DynamicColumn, DynamicColumnData, User
from api.schemas import DirectoryEditV, SubscriptionEditV, SubscriptionCreateV, SubDirectoryCreateV, SubDirectoryEditV, DynamicColumnCreateV, DynamicColumnEditV
from typing import List, Dict, Any
import os
import shutil
from fastapi.responses import FileResponse
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DATABASE_PATH = os.getenv('DATABASE_PATH')
BACKUP_PATH = os.getenv('BACKUP_PATH')

router = APIRouter()

def build_tree(
        directories: List[Directory],
):
    root_nodes = []

    for directory in directories:
        print(f"Directory: {str(directory.id) ,directory.adi,str(directory.ataId)}")
        if directory.ataId is None or directory.ataId is '':
            root_nodes.append(directory) 
            print(f"RootNode: {str(directory.id)}, {directory.adi}, {str(directory.ataId)}")
        else:
            continue

    if not root_nodes:
        print("Root Node Bulunamadı")
    
    tree = build_subtree(root_nodes, directories)
    return tree

def build_subtree(
        parent_nodes: List[Directory],
        all_nodes: List[Directory],
):
    subtree = []

    for parent in parent_nodes:
        print(f"Parent Node: {str(parent.id),parent.adi,str(parent.ataId)}")
        child_nodes = [node for node in all_nodes if node.ataId == parent.id]
        
        if not child_nodes:
            print(f"No child nodes found for parent node with id: {parent.id}")

        node = {
            'id': parent.id,
            'title': parent.adi,
            'children': build_subtree(child_nodes, all_nodes)
        }
        subtree.append(node)

    return subtree

@router.get("/getTree", summary="List all")
async def get_tree(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    try:
        directories = db.query(Directory).all()
    except Exception as e:
        print(f"Veritabanından veri alınırken bir hata oluştu: {str(e)}")
        raise HTTPException(status_code=500, detail="Veritabanından veri alınırken bir hata oluştu.")

    result = build_tree(directories)
    return result

@router.get("/getTreeForUser", summary="List all")
async def get_tree_for_user(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)  # Ensure the user is authenticated
):
    try:
        visible_directory = db.query(Directory).filter(Directory.visibility == 1).all()

    except Exception as e:
        print(f"Veritabanından veri alınırken bir hata oluştu: {str(e)}")
        raise HTTPException(status_code=500, detail="Veritabanından veri alınırken bir hata oluştu.")
    
    result = build_tree(visible_directory)
    return result

@router.post("/editNode", summary="Edit Node")
async def edit_node(
    node_data: DirectoryEditV, 
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)  # Ensure the user is authenticated
):

    db_node = db.query(Directory).filter(Directory.id == node_data.id).first()
    if not db_node:
        raise HTTPException(status_code=400, detail="Node not found")

    # Update fields only if provided
    if node_data.adi is not None and db_node.adi != node_data.adi:
        db_node.adi = node_data.adi
    if node_data.internal_number_area_code is not None and db_node.internal_number_area_code != node_data.internal_number_area_code:
        db_node.internal_number_area_code = node_data.internal_number_area_code
    if node_data.internal_number is not None and db_node.internal_number != node_data.internal_number:
        db_node.internal_number = node_data.internal_number
    if node_data.ip_number_area_code is not None and db_node.ip_number_area_code != node_data.ip_number_area_code:
        db_node.ip_number_area_code = node_data.ip_number_area_code
    if node_data.ip_number is not None and db_node.ip_number != node_data.ip_number:
        db_node.ip_number = node_data.ip_number
    if node_data.mailbox is not None and db_node.mailbox != node_data.mailbox:
        db_node.mailbox = node_data.mailbox
    if node_data.visibility is not None and db_node.visibility != node_data.visibility:
        db_node.visibility = node_data.visibility
    if node_data.visibilityForSubDirectory is not None and db_node.visibilityForSubDirectory != node_data.visibilityForSubDirectory:
        db_node.visibilityForSubDirectory = node_data.visibilityForSubDirectory
    if node_data.internal_number_subscription_id is not None and db_node.internal_number_subscription_id != node_data.internal_number_subscription_id:
        db_node.internal_number_subscription_id = node_data.internal_number_subscription_id
    if node_data.ip_number_subscription_id is not None and db_node.ip_number_subscription_id != node_data.ip_number_subscription_id:
        db_node.ip_number_subscription_id = node_data.ip_number_subscription_id
    
     # Process dynamic columns
    if node_data.dynamicColumns:
        for dynamic_column in node_data.dynamicColumns:
            dynamic_data = db.query(DynamicColumnData).filter(
                DynamicColumnData.attributeid == dynamic_column.id,
                DynamicColumnData.tableid == 1,
                DynamicColumnData.recordid == node_data.id
            ).first()
            if dynamic_data:
                dynamic_data.value = dynamic_column.value
            else:
                new_column = DynamicColumnData(
                    attributeid=dynamic_column.id,
                    tableid=1, 
                    recordid=node_data.id,
                    value=dynamic_column.value
                )
                db.add(new_column)
    
    db.commit()

    dynamic_columns_response = []
    for column in node_data.dynamicColumns:
        dynamic_columns_response.append({
            "id": column.id,
            "value": column.value
        })
    
    return {
        "adi": db_node.adi,
        "internal_number_area_code": db_node.internal_number_area_code,
        "internal_number": db_node.internal_number,
        "ip_number_area_code": db_node.ip_number_area_code,
        "ip_number": db_node.ip_number,
        "mailbox": db_node.mailbox,
        "visibility": db_node.visibility,
        "visibilityForSubDirectory": db_node.visibilityForSubDirectory,
        "internal_number_subscription_id": db_node.internal_number_subscription_id,
        "ip_number_subscription_id": db_node.ip_number_subscription_id,
        "dynamicColumns": dynamic_columns_response

    }

@router.get("/getNode/{id}", summary="Get Node and its Sub-nodes")
async def get_node(
    id: int, 
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)  # Ensure the user is authenticated
) -> Dict:
    def get_node_and_subnodes(node_id: int) -> Dict:
        # Fetch the node
        
        query = db.query(Directory).filter(Directory.id == node_id)

        # Eğer user.role == 2 ise, sadece visibility == 1 olanları sorgula
        if user.role == 2:
            query = query.filter(Directory.visibility == 1)
       
        directory = query.first()

        dynamic_column = db.query(DynamicColumn).all()

        if not directory:
            return {"id": node_id, "children": []}

        internal_subscription = db.query(SubscriptionTypes).filter(SubscriptionTypes.id == directory.internal_number_subscription_id).first()
        ip_subscription = db.query(SubscriptionTypes).filter(SubscriptionTypes.id == directory.ip_number_subscription_id).first()
        
        dynamic_columns_response = []
        dynamic_column_data = db.query(DynamicColumnData).filter(DynamicColumnData.tableid == 1, DynamicColumnData.recordid == directory.id).all()
        for column in dynamic_column:
            for dynamic_data in dynamic_column_data:
                if int(dynamic_data.attributeid) == column.id:
                    dynamic_columns_response.append({
                        "id": column.id,
                        "attribute_name": column.attribute_name,
                        "value": dynamic_data.value
                    })

        # Prepare the node data
        node_data = {
            "id": directory.id,
            "adi": directory.adi,
            "internal_number_area_code": directory.internal_number_area_code,
            "internal_number": directory.internal_number,
            "ip_number_area_code": directory.ip_number_area_code,
            "ip_number": directory.ip_number,
            "mailbox": directory.mailbox,
            "visibility": directory.visibility,
            "visibilityForSubDirectory": directory.visibilityForSubDirectory,
            "internal_number_subscription_id": directory.internal_number_subscription_id,
            "internal_subscription": internal_subscription.subscription_types if internal_subscription is not None else "-",
            "ip_number_subscription_id": directory.ip_number_subscription_id,
            "ip_subscription": ip_subscription.subscription_types if ip_subscription is not None else "-",
            "dynamicColumns": dynamic_columns_response,
            "children": []  # Initialize the children
        }


        # Fetch and add child nodes
        

        sub_query = db.query(Directory).filter(Directory.ataId == directory.id)

        # Eğer user.role == 2 ise, sadece visibility == 1 olanları sorgula
        if user.role == 2:
            sub_query = sub_query.filter(Directory.visibility == 1)
       
        sub_directories = sub_query.all()

        for sub_directory in sub_directories:
            sub_node_data = get_node_and_subnodes(sub_directory.id)
            node_data["children"].append(sub_node_data)

        return node_data

    # Fetch the main node and its sub-nodes
    result = get_node_and_subnodes(id)
    return result

@router.get("/getSubscription", summary="Get Subcsription Types")
async def get_subscription(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)  # Ensure the user is authenticated
):
    result = []

    subscription = db.query(SubscriptionTypes).all()

    for subs in subscription:
        result.append({
            "value": subs.id,
            "label": subs.subscription_types
        })

    return result

@router.put("/editSubscription", summary="Edit Subscription")
async def edit_subscription(
    subs: SubscriptionEditV,  # FastAPI will automatically parse this from the request body
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)  # Ensure the user is authenticated
):
    # Query the database for the subscription type by ID
    db_subs = db.query(SubscriptionTypes).filter(SubscriptionTypes.id == subs.id).first()

    if not db_subs:
        raise HTTPException(status_code=404, detail="Subscription not found")

    # Update the subscription type if different
    if db_subs.subscription_types != subs.subscription_types:
        db_subs.subscription_types = subs.subscription_types

    # Commit the changes to the database
    db.commit()

    return {
        "id": db_subs.id,
        "subscription_types": db_subs.subscription_types
    }

@router.post("/addSubscription", summary="Add Subscription")
async def add_subscription(
    subscription: SubscriptionCreateV,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)  # Ensure the user is authenticated
):
    new_sub = SubscriptionTypes(subscription_types=subscription.subscription_types)
    db.add(new_sub)
    try:
        db.commit()
        return {"status": "success", "message": "Subscription added successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")

@router.delete("/deleteSubscription/{id}", summary="Delete Subscription")
async def delete_subscription(
    id: int, 
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)  # Ensure the user is authenticated
):
    # Fetch the subscription to delete
    subscription = db.query(SubscriptionTypes).filter(SubscriptionTypes.id == id).first()

    # If subscription is not found, raise a 404 error
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )

    # Delete the subscription
    db.delete(subscription)

    # Commit the transaction
    db.commit()

    return {"detail": "Subscription deleted successfully"}

@router.post("/backupDatabase", summary="Backup Database and Download")
async def backup_database_and_download(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)  # Ensure the user is authenticated
):
    try:
        # Yedekleme dizinini oluştur
        os.makedirs(BACKUP_PATH, exist_ok=True)
        
        # Yedekleme dosyasının adını oluştur
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f'database_backup_{timestamp}.db'
        backup_path = os.path.join(BACKUP_PATH, backup_filename)

        # Veritabanını yedekle
        shutil.copy2(DATABASE_PATH, backup_path)

        # Yedekleme dosyasını döndür
        return FileResponse(backup_path, filename=backup_filename, headers={"Content-Disposition": f"attachment; filename={backup_filename}"})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")
    
@router.post("/restoreDatabase", summary="Restore Database from Backup")
async def restore_database(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user)  # Ensure the user is authenticated
):
    try:
        # Geçici dosya yolu oluştur
        temp_file_path = os.path.join(BACKUP_PATH, file.filename)

        # Yüklenen dosyayı geçici dosya olarak kaydet
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Veritabanını geri yükle
        shutil.copy2(temp_file_path, DATABASE_PATH)

        # Geçici dosyayı sil
        os.remove(temp_file_path)

        return {"status": "success", "message": "Database restored successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")

@router.post('/addSubDirectory', summary="Add SubDirectory")
def add_sub_directory(
    subDirectory: SubDirectoryCreateV,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)  # Ensure the user is authenticated
):
    
    new_sub_directory = Sub_Directory(
        directoryid=subDirectory.directoryid,
        adi= subDirectory.adi,
        internal_number_area_code=subDirectory.internal_number_area_code,
        internal_number=subDirectory.internal_number,
        internal_number_subscription_id=subDirectory.internal_number_subscription_id,
        ip_number_area_code=subDirectory.ip_number_area_code,
        ip_number=subDirectory.ip_number,
        ip_number_subscription_id=subDirectory.ip_number_subscription_id,
        mailbox=subDirectory.mailbox,
    )

    db.add(new_sub_directory)

    try:
        db.commit()

        if subDirectory.dynamicColumns:
                for dynamic_column in subDirectory.dynamicColumns:
                    new_column = DynamicColumnData(
                                    attributeid=dynamic_column.id,
                                    tableid=2, 
                                    recordid=new_sub_directory.id,
                                    value=dynamic_column.value
                                )
                    db.add(new_column)
                    db.commit()
        return {"status": "success", "message": "Subscription added successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    
@router.get("/getSubDirectory/{id}", summary="Get SubDirectory")
async def get_sub_directory(
    id: int, 
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)  # Ensure the user is authenticated
):
    result = []

    
    query = db.query(Directory).filter(Directory.id == id)
    if user.role == 2:
        query = query.filter(Directory.visibility == 1, Directory.visibilityForSubDirectory == 1)
        
    directory = query.first()
    sub_direcories = db.query(Sub_Directory).filter(Sub_Directory.directoryid == directory.id).all()
    dynamic_column = db.query(DynamicColumn).all()

    for subs in sub_direcories: 
        internal_subscription = db.query(SubscriptionTypes).filter(SubscriptionTypes.id == subs.internal_number_subscription_id).first()
        ip_subscription = db.query(SubscriptionTypes).filter(SubscriptionTypes.id == subs.ip_number_subscription_id).first()
        
        dynamic_columns_response = []
        dynamic_column_data = db.query(DynamicColumnData).filter(DynamicColumnData.tableid == 2, DynamicColumnData.recordid == subs.id).all()
        
        for column in dynamic_column:
            for dynamic_data in dynamic_column_data:
                
                if int(dynamic_data.attributeid) == column.id:
                    dynamic_columns_response.append({
                        "id": column.id,
                        "attribute_name": column.attribute_name,
                        "value": dynamic_data.value
                    })

        result.append({
            "id": subs.id,
            "directoryid": subs.directoryid,
            "adi": subs.adi,
            "internal_number_area_code": subs.internal_number_area_code,
            "internal_number": subs.internal_number,
            "internal_number_subscription_id": subs.internal_number_subscription_id,
            "ip_number_area_code": subs.ip_number_area_code,
            "ip_number": subs.ip_number,
            "ip_number_subscription_id": subs.ip_number_subscription_id,
            "mailbox": subs.mailbox,
            "internal_subscription": internal_subscription.subscription_types if internal_subscription is not None else "-",   
            "ip_subscription": ip_subscription.subscription_types if ip_subscription is not None else "-",
            "dynamicColumns": dynamic_columns_response
        })

    return result

@router.post("/editSubNode", summary="Edit Node")
async def edit_sub_node(
    node_data: SubDirectoryEditV, 
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)  # Ensure the user is authenticated
):
    try:
        subs = db.query(Sub_Directory).filter(Sub_Directory.id == node_data.id).first()
        if not subs:
            raise HTTPException(status_code=404, detail="Node not found")

        # Update fields only if provided
        if node_data.adi is not None and subs.adi != node_data.adi:
            subs.adi = node_data.adi
        if node_data.internal_number_area_code is not None and subs.internal_number_area_code != node_data.internal_number_area_code:
            subs.internal_number_area_code = node_data.internal_number_area_code
        if node_data.internal_number is not None and subs.internal_number != node_data.internal_number:
            subs.internal_number = node_data.internal_number
        if node_data.ip_number_area_code is not None and subs.ip_number_area_code != node_data.ip_number_area_code:
            subs.ip_number_area_code = node_data.ip_number_area_code
        if node_data.ip_number is not None and subs.ip_number != node_data.ip_number:
            subs.ip_number = node_data.ip_number
        if node_data.mailbox is not None and subs.mailbox != node_data.mailbox:
            subs.mailbox = node_data.mailbox
        if node_data.internal_number_subscription_id is not None and subs.internal_number_subscription_id != node_data.internal_number_subscription_id:
            subs.internal_number_subscription_id = node_data.internal_number_subscription_id
        if node_data.ip_number_subscription_id is not None and subs.ip_number_subscription_id != node_data.ip_number_subscription_id:
            subs.ip_number_subscription_id = node_data.ip_number_subscription_id

        # Process dynamic columns
        if node_data.dynamicColumns:
            for dynamic_column in node_data.dynamicColumns:
                dynamic_data = db.query(DynamicColumnData).filter(
                    DynamicColumnData.attributeid == dynamic_column.id,
                    DynamicColumnData.tableid == 2,
                    DynamicColumnData.recordid == node_data.id
                ).first()
                if dynamic_data:
                    dynamic_data.value = dynamic_column.value
                else:
                    new_column = DynamicColumnData(
                        attributeid=dynamic_column.id,
                        tableid=2, 
                        recordid=node_data.id,
                        value=dynamic_column.value
                    )
                    db.add(new_column)

        db.commit()

        dynamic_columns_response = []
        for column in node_data.dynamicColumns:
            dynamic_columns_response.append({
                "id": column.id,
                "value": column.value
            })

        return {
            "adi": subs.adi,
            "internal_number_area_code": subs.internal_number_area_code,
            "internal_number": subs.internal_number,
            "ip_number_area_code": subs.ip_number_area_code,
            "ip_number": subs.ip_number,
            "mailbox": subs.mailbox,
            "internal_number_subscription_id": subs.internal_number_subscription_id,
            "ip_number_subscription_id": subs.ip_number_subscription_id,
            "dynamicColumns": dynamic_columns_response
        }

    except Exception as e:
        db.rollback()
        print(f"Error: {str(e)}")  # Enhanced logging for debugging
        raise HTTPException(status_code=500, detail="Database error occurred")

@router.delete("/deleteSubDirectory/{id}", summary="Delete SubDirectory")
async def delete_sub_Directory(
    id: int, 
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)  # Ensure the user is authenticated
):
    # Fetch the subscription to delete
    subs = db.query(Sub_Directory).filter(Sub_Directory.id == id).first()

    # If subscription is not found, raise a 404 error
    if not subs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )

    # Delete the subscription
    db.delete(subs)

    # Commit the transaction
    db.commit()

    return {"detail": "SubDirectory deleted successfully"}

@router.get("/getDynamicColumn", summary="Get Dynamic Column")
async def get_dynamic_column(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)  # Ensure the user is authenticated
):
    result = []

    dynamicColumn = db.query(DynamicColumn).all()

    for column in dynamicColumn:
        result.append({
            "id": column.id,
            "attribute_name": column.attribute_name
        })

    return result

@router.post("/addDynamicColumn", summary="Add DynamicColumn")
async def add_dynamic_column(
    dynamicColum: DynamicColumnCreateV,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)  # Ensure the user is authenticated
):
    new_column = DynamicColumn(attribute_name=dynamicColum.attribute_name)
    db.add(new_column)
    try:
        db.commit()
        return {"status": "success", "message": "DynamicColumn added successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    
@router.put("/editDynamicColumn", summary="Edit DynamicColumn")
async def edit_dynamic_column(
    column: DynamicColumnEditV,  # FastAPI will automatically parse this from the request body
    db: Session = Depends(get_db)
):
    db_column = db.query(DynamicColumn).filter(DynamicColumn.id == column.id).first()

    if not db_column:
        raise HTTPException(status_code=404, detail="DynamicColumn not found")

    if db_column.attribute_name != column.attribute_name:
        db_column.attribute_name = column.attribute_name

    db.commit()

    return {
        "id": db_column.id,
        "attribute_name": db_column.attribute_name
    }

@router.delete("/deleteDynamicColumn/{id}", summary="Delete DynamicColumn")
async def delete_dynamic_column(
    id: int, 
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)  # Ensure the user is authenticated
):
    column = db.query(DynamicColumn).filter(DynamicColumn.id == id).first()

    if not column:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="DynamicColumn not found"
        )
    else:
        column_data = db.query(DynamicColumnData).filter(DynamicColumnData.attributeid == column.id).all()
        if column_data:
            for datas in column_data:
                db.delete(datas)


    db.delete(column)

    db.commit()

    return {"detail": "DynamicColumn deleted successfully"}